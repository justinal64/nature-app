#!/usr/bin/env python3
"""Build a training image set for the offline species classifier (issue #3).

Pulls research-grade, permissively-licensed, Southwest-US photos for the
WildLens catalog species from the iNaturalist API + Open Data photo store.
This touches iNaturalist for TRAINING DATA ONLY — the resulting dataset (and the
model trained from it) has no runtime dependency on iNaturalist.

What it produces:
  <output>/<species-id>/<photo_id>.jpg   images in ImageFolder layout
  <output>/manifest.csv                  per-image provenance + CC-BY attribution
  <output>/report.csv                    per-species found/downloaded counts

Usage:
  pip install requests
  python scripts/pull_inat_dataset.py --counts-only            # availability check, no downloads
  python scripts/pull_inat_dataset.py --min-available 200      # only species with >=200 imgs (needs a prior --counts-only)
  python scripts/pull_inat_dataset.py --kinds bird,snake       # only some groups
  python scripts/pull_inat_dataset.py --species saguaro,coyote # explicit subset
  python scripts/pull_inat_dataset.py --per-species 500        # full pull with a cap

Nothing is downloaded in --counts-only mode. Re-running skips images already on
disk, so an interrupted pull resumes cleanly.

Licensing: only cc0 / cc-by / cc-by-sa photos are requested and stored. CC BY
requires crediting each photographer — manifest.csv keeps the attribution string
for every image so an in-app credits list can be generated later.
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("This script needs `requests`. Run: pip install requests")

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG_TS = REPO_ROOT / "constants" / "catalog.ts"

API_BASE = "https://api.inaturalist.org/v1"
USER_AGENT = "WildLens-dataset-builder/1.0 (offline classifier training; contact: justinal8183@gmail.com)"

# Permissive licenses only — excludes all-rights-reserved and ND/NC.
ALLOWED_LICENSES = ("cc0", "cc-by", "cc-by-sa")

# Default geographic window: a bounding box over the Sonoran / Southwest US
# region (swlat, swlng, nelat, nelng). Roughly SE California + Arizona + NW
# Mexico. Override with --no-geo to pull globally for data-starved species.
DEFAULT_BBOX = (28.0, -117.5, 37.5, -108.0)

# Politeness (all overridable via CLI flags). iNat asks for <=60 req/min and a
# real User-Agent. One API request per ~1.1s keeps us well under that. Image
# GETs hit the static Open Data store (S3), not the API, but we still throttle
# them: a small worker pool plus a per-image delay in each worker.
API_DELAY_S = 1.1        # seconds between iNat API requests (~1/sec)
DOWNLOAD_WORKERS = 4     # concurrent image downloads
DOWNLOAD_DELAY_S = 0.25  # seconds each worker waits after every image GET
PER_PAGE = 200  # API max

# ---------------------------------------------------------------------------
# Catalog parsing
# ---------------------------------------------------------------------------

# Matches each catalog entry: id, commonName (single OR double quoted, e.g.
# "Gambel's Quail"), latin, kind — in the order they appear in catalog.ts.
_ENTRY_RE = re.compile(
    r"id:\s*'([^']+)'"
    r".*?commonName:\s*(['\"])(.*?)\2"
    r".*?latin:\s*'([^']+)'"
    r".*?kind:\s*'([^']+)'",
    re.DOTALL,
)


def load_species_from_catalog() -> list[dict]:
    text = CATALOG_TS.read_text(encoding="utf-8")
    species = []
    for m in _ENTRY_RE.finditer(text):
        species.append(
            {"id": m.group(1), "common": m.group(3), "latin": m.group(4), "kind": m.group(5)}
        )
    if not species:
        sys.exit(f"Parsed 0 species from {CATALOG_TS} — the catalog format may have changed.")
    return species


# ---------------------------------------------------------------------------
# iNaturalist API
# ---------------------------------------------------------------------------


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
    return s


def resolve_taxon_id(session: requests.Session, latin: str) -> int | None:
    """Resolve a scientific name to an iNat taxon_id (exact match preferred)."""
    r = session.get(f"{API_BASE}/taxa", params={"q": latin, "per_page": 5}, timeout=30)
    time.sleep(API_DELAY_S)
    r.raise_for_status()
    results = r.json().get("results", [])
    for t in results:
        if t.get("name", "").lower() == latin.lower():
            return t["id"]
    return results[0]["id"] if results else None


def iter_observations(session: requests.Session, taxon_id: int, bbox, place_id, cap: int):
    """Yield research-grade observations for a taxon, newest first.

    Uses id_below cursor pagination so it works past the API's 10k page-offset
    ceiling for species with many observations.
    """
    params = {
        "taxon_id": taxon_id,
        "quality_grade": "research",
        "photos": "true",
        "photo_license": ",".join(ALLOWED_LICENSES),
        "per_page": PER_PAGE,
        "order_by": "id",
        "order": "desc",
    }
    if place_id:
        params["place_id"] = place_id
    elif bbox:
        swlat, swlng, nelat, nelng = bbox
        params.update({"swlat": swlat, "swlng": swlng, "nelat": nelat, "nelng": nelng})

    seen = 0
    id_below = None
    while seen < cap:
        page_params = dict(params)
        if id_below is not None:
            page_params["id_below"] = id_below
        r = session.get(f"{API_BASE}/observations", params=page_params, timeout=60)
        time.sleep(API_DELAY_S)
        r.raise_for_status()
        results = r.json().get("results", [])
        if not results:
            break
        for obs in results:
            yield obs
            seen += 1
            if seen >= cap:
                break
        id_below = results[-1]["id"]


def photos_from_obs(obs: dict, per_obs: int) -> list[dict]:
    """Extract up to `per_obs` usable CC photos from an observation."""
    out = []
    for p in obs.get("photos", []):
        lic = (p.get("license_code") or "").lower()
        if lic not in ALLOWED_LICENSES:
            continue
        url = p.get("url", "")
        if not url:
            continue
        # API returns the "square" thumb URL; medium is the training size.
        medium_url = url.replace("/square.", "/medium.")
        out.append(
            {
                "photo_id": p["id"],
                "observation_id": obs["id"],
                "license": lic,
                "attribution": p.get("attribution", ""),
                "source_url": medium_url,
            }
        )
        if len(out) >= per_obs:
            break
    return out


# ---------------------------------------------------------------------------
# Downloading
# ---------------------------------------------------------------------------


def download_one(session: requests.Session, rec: dict, dest_dir: Path) -> bool:
    ext = os.path.splitext(rec["source_url"])[1] or ".jpg"
    path = dest_dir / f"{rec['photo_id']}{ext}"
    if path.exists() and path.stat().st_size > 0:
        return True  # resume: already have it
    try:
        r = session.get(rec["source_url"], timeout=60)
        time.sleep(DOWNLOAD_DELAY_S)  # throttle the photo store politely
        if r.status_code != 200 or not r.content:
            return False
        path.write_bytes(r.content)
        return True
    except requests.RequestException:
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def parse_args(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--output", default=str(REPO_ROOT / "inat_dataset"), help="dataset output dir")
    ap.add_argument("--per-species", type=int, default=500, help="max images per species")
    ap.add_argument("--per-obs", type=int, default=1, help="photos per observation (1 = most diverse)")
    ap.add_argument("--species", default="", help="comma-separated catalog ids to include (default: all)")
    ap.add_argument("--kinds", default="", help="comma-separated kinds to include, e.g. bird,snake")
    ap.add_argument("--min-available", type=int, default=0,
                    help="only pull species with >= N images in the counts report (0 = off)")
    ap.add_argument("--report", default=None,
                    help="path to the counts report for --min-available (default: <output>/report_counts.csv)")
    ap.add_argument("--place-id", type=int, default=None, help="iNat place_id instead of the default bbox")
    ap.add_argument("--no-geo", action="store_true", help="disable the geographic filter (global pull)")
    ap.add_argument("--counts-only", action="store_true", help="report availability, download nothing")
    ap.add_argument("--api-delay", type=float, default=API_DELAY_S,
                    help=f"seconds between iNat API requests (default {API_DELAY_S})")
    ap.add_argument("--workers", type=int, default=DOWNLOAD_WORKERS,
                    help=f"concurrent image downloads (default {DOWNLOAD_WORKERS})")
    ap.add_argument("--download-delay", type=float, default=DOWNLOAD_DELAY_S,
                    help=f"seconds each worker waits per image (default {DOWNLOAD_DELAY_S})")
    return ap.parse_args(argv)


def select_species(all_species, args) -> list[dict]:
    picked = all_species
    if args.species:
        wanted = {s.strip() for s in args.species.split(",") if s.strip()}
        picked = [s for s in picked if s["id"] in wanted]
    if args.kinds:
        kinds = {k.strip() for k in args.kinds.split(",") if k.strip()}
        picked = [s for s in picked if s["kind"] in kinds]
    return picked


def filter_by_report(species: list[dict], report_path: Path, min_available: int) -> list[dict]:
    """Keep only species with >= min_available images per a prior counts report."""
    if not report_path.exists():
        sys.exit(f"--min-available needs a counts report at {report_path}. "
                 f"Run `--counts-only` first.")
    counts: dict[str, int] = {}
    with report_path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            try:
                counts[row["species_id"]] = int(row["found"])
            except (KeyError, ValueError):
                continue
    kept, dropped = [], []
    for sp in species:
        if counts.get(sp["id"], -1) >= min_available:
            kept.append(sp)
        else:
            dropped.append(f"{sp['id']} ({counts.get(sp['id'], 'not in report')})")
    print(f"--min-available {min_available}: kept {len(kept)}, dropped {len(dropped)} below threshold\n")
    return kept


def dedupe_by_latin(species: list[dict]) -> list[dict]:
    """Drop catalog entries that share a scientific name (keep the first).

    The catalog has duplicate species (same latin under two ids). Training two
    classes for one species conflicts labels and pulls identical images twice,
    so collapse them here and warn.
    """
    seen: dict[str, str] = {}
    kept, collisions = [], []
    for sp in species:
        key = sp["latin"].lower()
        if key in seen:
            collisions.append(f"{sp['id']} (dup of {seen[key]} — {sp['latin']})")
        else:
            seen[key] = sp["id"]
            kept.append(sp)
    if collisions:
        print("WARNING: dropped duplicate-species entries (also a catalog bug worth fixing):")
        for c in collisions:
            print(f"  - {c}")
        print()
    return kept


def main(argv=None):
    args = parse_args(argv)
    global API_DELAY_S, DOWNLOAD_WORKERS, DOWNLOAD_DELAY_S
    API_DELAY_S = args.api_delay
    DOWNLOAD_WORKERS = args.workers
    DOWNLOAD_DELAY_S = args.download_delay

    bbox = None if args.no_geo else DEFAULT_BBOX
    out_root = Path(args.output)
    session = make_session()

    species = dedupe_by_latin(select_species(load_species_from_catalog(), args))
    if args.min_available > 0:
        report_path = Path(args.report) if args.report else (out_root / "report_counts.csv")
        species = filter_by_report(species, report_path, args.min_available)
    print(f"Selected {len(species)} species "
          f"(geo={'off' if args.no_geo else (f'place {args.place_id}' if args.place_id else 'Sonoran bbox')}, "
          f"cap={args.per_species}/species, counts_only={args.counts_only})")
    print(f"Pacing: {API_DELAY_S:.2f}s/API request, "
          f"{DOWNLOAD_WORKERS} download workers x {DOWNLOAD_DELAY_S:.2f}s/image\n")

    if not args.counts_only:
        out_root.mkdir(parents=True, exist_ok=True)
    manifest_rows: list[dict] = []
    report_rows: list[dict] = []

    for i, sp in enumerate(species, 1):
        prefix = f"[{i}/{len(species)}] {sp['id']} ({sp['latin']}, {sp['kind']})"
        try:
            taxon_id = resolve_taxon_id(session, sp["latin"])
        except requests.RequestException as e:
            print(f"{prefix}: taxon lookup failed ({e})")
            continue
        if not taxon_id:
            print(f"{prefix}: no iNat taxon match — skipping")
            report_rows.append({**_report_base(sp), "found": 0, "downloaded": 0})
            continue

        recs: list[dict] = []
        for obs in iter_observations(session, taxon_id, bbox, args.place_id, args.per_species):
            recs.extend(photos_from_obs(obs, args.per_obs))
            if len(recs) >= args.per_species:
                break
        recs = recs[: args.per_species]

        if args.counts_only:
            print(f"{prefix}: {len(recs)} available")
            report_rows.append({**_report_base(sp), "found": len(recs), "downloaded": 0})
            continue

        dest = out_root / sp["id"]
        dest.mkdir(parents=True, exist_ok=True)
        ok = 0
        with ThreadPoolExecutor(max_workers=DOWNLOAD_WORKERS) as pool:
            futures = {pool.submit(download_one, session, rec, dest): rec for rec in recs}
            for fut in as_completed(futures):
                rec = futures[fut]
                if fut.result():
                    ok += 1
                    ext = os.path.splitext(rec["source_url"])[1] or ".jpg"
                    manifest_rows.append(
                        {
                            "species_id": sp["id"],
                            "latin": sp["latin"],
                            "kind": sp["kind"],
                            "photo_id": rec["photo_id"],
                            "observation_id": rec["observation_id"],
                            "license": rec["license"],
                            "attribution": rec["attribution"],
                            "source_url": rec["source_url"],
                            "filepath": str((dest / f"{rec['photo_id']}{ext}").relative_to(out_root)),
                        }
                    )
        print(f"{prefix}: {ok}/{len(recs)} downloaded")
        report_rows.append({**_report_base(sp), "found": len(recs), "downloaded": ok})

    _write_csv(out_root / "report.csv", report_rows,
               ["species_id", "latin", "kind", "found", "downloaded"], args.counts_only)
    if not args.counts_only and manifest_rows:
        _write_csv(out_root / "manifest.csv", manifest_rows,
                   ["species_id", "latin", "kind", "photo_id", "observation_id",
                    "license", "attribution", "source_url", "filepath"], False)

    total = sum(r["downloaded"] for r in report_rows)
    starved = [r["species_id"] for r in report_rows if r["found"] < 50]
    print(f"\nDone. {total} images across {len(report_rows)} species.")
    if starved:
        print(f"Data-starved (<50 available): {', '.join(starved)}")


def _report_base(sp: dict) -> dict:
    return {"species_id": sp["id"], "latin": sp["latin"], "kind": sp["kind"]}


def _write_csv(path: Path, rows: list[dict], fields: list[str], counts_only: bool):
    if counts_only:
        path = path.with_name("report_counts.csv")
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
