#!/usr/bin/env bash
#
# Assemble a deduped, ImageFolder-layout training dataset for one region by
# merging several source pull directories (SW: base + sw_plants + sw_snakes;
# SE: base + se_birds + se_plants + ... — see model-update-runbook.md Step 1).
#
# Why this exists: the source pulls overlap *within* a region (e.g. a cardinal
# lives in both the general SE set and se_birds; saguaro is in both the SW
# desert set and sw_plants). Class folders get merged by name; files are
# deduped by filename (iNat photo ids are unique, so cp -n never duplicates).
# Copies both .jpg and .jpeg — the puller saves both, and missing .jpeg was a
# past undercounting bug in per-species reports.
#
# The source pulls are broader than what's actually curated into the app
# catalog (e.g. the raw SE sub-pulls cover ~1,300+ species; constants/catalog.ts
# only has the reviewed 282-species v1 batch). Training on every folder here
# would produce a species_labels.json with ids catalog.ts doesn't know —
# violating the model/labels/catalog invariant in model-update-runbook.md. So
# by default this script PRUNES the merged output to only the class folders
# whose name is a catalog id. Pass --no-prune to keep the full raw merge
# (e.g. to review what's available before the next catalog batch).
#
# Usage:
#   scripts/build_region_dataset.sh [--no-prune] <output-dir> <source-dir> [source-dir...]
#
# Example (run from the repo root; source/output dirs are siblings of the repo):
#   scripts/build_region_dataset.sh ../model_training_data_SW_final \
#     ../model_training_data ../model_training_data_sw_plants ../model_training_data_sw_snakes
#
#   scripts/build_region_dataset.sh ../model_training_data_SE_final \
#     ../model_training_data_se ../model_training_data_se_plants \
#     ../model_training_data_se_birds ../model_training_data_se_dragonflies \
#     ../model_training_data_se_amphibians ../model_training_data_se_snakes \
#     ../model_training_data_se_fungi ../model_training_data_se_mammals \
#     ../model_training_data_se_lizards ../model_training_data_se_fish \
#     ../model_training_data_se_butterflies ../model_training_data_se_crayfish \
#     ../model_training_data_se_mollusks
#
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

prune=1
if [[ "${1:-}" == "--no-prune" ]]; then
  prune=0
  shift
fi

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 [--no-prune] <output-dir> <source-dir> [source-dir...]" >&2
  exit 1
fi

out="$1"; shift
mkdir -p "$out"

for src in "$@"; do
  if [[ ! -d "$src" ]]; then
    echo "  (skip — not found: $src)"
    continue
  fi
  for d in "$src"/*/; do
    [[ -d "$d" ]] || continue
    name=$(basename "$d")
    mkdir -p "$out/$name"
    cp -n "$d"*.jpg "$out/$name/" 2>/dev/null || true
    cp -n "$d"*.jpeg "$out/$name/" 2>/dev/null || true
  done
done

classes=$(find "$out" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
images=$(find "$out" -type f \( -name '*.jpg' -o -name '*.jpeg' \) | wc -l | tr -d ' ')
echo "$out (raw merge): $classes classes, $images images"

if [[ "$prune" == "1" ]]; then
  catalog_ids=$(grep -oE "id: '[^']+'" constants/catalog.ts | sed -E "s/id: '(.*)'/\1/" | sort -u)
  dropped=0
  for d in "$out"/*/; do
    [[ -d "$d" ]] || continue
    name=$(basename "$d")
    if ! grep -qx "$name" <<< "$catalog_ids"; then
      rm -rf "$d"
      dropped=$((dropped + 1))
    fi
  done
  classes=$(find "$out" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
  images=$(find "$out" -type f \( -name '*.jpg' -o -name '*.jpeg' \) | wc -l | tr -d ' ')
  echo "$out (pruned to catalog.ts, dropped $dropped non-catalog classes): $classes classes, $images images"
fi
