# On-Device Species ID Models

The app identifies species offline with WildLens's own TFLite classifiers,
trained over the catalog species (see `scripts/train_classifier.ipynb` and
`custom-model-pipeline.md`). Each is well under 1 MB, so both are **bundled
directly in the app binary** — no runtime download.

As of the Southeast expansion (2026-07), WildLens ships **two separate
regional models** rather than one national model (decision: keep classes
per-region instead of diluting accuracy across ~340 combined species) — the
app picks between them by the user's location, the way Merlin ships regional
bird packs.

## Files in this directory

- `species_id_sw.tflite` / `species_labels_sw.json` — Southwest model.
  MobileNetV3Small backbone, INT8-quantized (uint8 in/out), fine-tuned on the
  83-species Sonoran/Mojave/Chihuahuan/Great Basin catalog core.
- `species_id_se.tflite` / `species_labels_se.json` — Southeast model. Same
  architecture, fine-tuned on the 256-species Southeast catalog pack
  (FL–NC/TN, west to E. Texas/Louisiana).

Each `species_labels_*.json` is a flat JSON array; index `i` is that model's
output index, value is the matching `catalog.ts` species `id` directly (no
scientific-name indirection needed, unlike the old public iNat model).

All four files are committed to git — small enough not to need Git LFS.

## How it's loaded

`lib/local-identify.ts` bundles all four files via
`require('../assets/models/...')` and loads whichever model matches the
user's detected region (`getRegionForCoords` in `constants/catalog.ts`) with
`loadTensorflowModel(MODEL_ASSETS[variant], [])`, caching each variant
separately once loaded. If location permission hasn't been granted (or a fix
isn't available), it defaults to the Southwest model rather than prompting —
identify shouldn't be gated on a new permission dialog. Metro is configured in
`metro.config.js` (`config.resolver.assetExts.push('tflite')`) to treat
`.tflite` as a binary asset.

`context/ModelInitContext.tsx` / the Profile screen's "Offline ID model" card
still exist from the old download-based flow; `isModelDownloaded()` /
`downloadModel()` in `local-identify.ts` are now harmless no-ops (the model is
always present) so that code keeps working unchanged and reports "ready"
immediately. Since there's no real download left to show progress for, it's
fine to simplify/retire that UI later.

## Retraining / updating the model

Every time species are added to `constants/catalog.ts`:

1. Re-run Phase 1 (`scripts/pull_inat_dataset.py --species <new-ids>`).
2. Re-run `scripts/train_classifier.ipynb` on the expanded set for that
   region.
3. Copy the new `species_id_{sw,se}.tflite` + `species_labels_{sw,se}.json`
   in here (matching the region you retrained), replacing the old ones, and
   rebuild the app.

## GPU acceleration

The `react-native-fast-tflite` config plugin bundles CoreML (iOS) and GPU
(Android) delegates. The code uses CPU-only inference (`delegates: []`) for
broad model compatibility. To try CoreML, change `loadTensorflowModel({ url },
[])` to `loadTensorflowModel({ url }, ['core-ml'])` and test on a physical
device.
