# On-Device Species ID Model

The app identifies species offline with WildLens's own TFLite classifier,
trained over the catalog species (see `scripts/train_classifier.ipynb` and
`custom-model-pipeline.md`). At ~0.6 MB it's **bundled directly in the app
binary** — no runtime download.

## Files in this directory

- `species_id.tflite` — MobileNetV3Small backbone, INT8-quantized
  (uint8 in/out), fine-tuned on the 83-species catalog core.
- `species_labels.json` — flat JSON array; index `i` is the model's output
  index, value is the matching `catalog.ts` species `id` directly (no
  scientific-name indirection needed, unlike the old public iNat model).

Both are committed to git — small enough not to need Git LFS.

## How it's loaded

`lib/local-identify.ts` bundles both files via `require('@/assets/models/...')`
and loads the model with `loadTensorflowModel(MODEL_ASSET, [])`. Metro is
configured in `metro.config.js` (`config.resolver.assetExts.push('tflite')`) to
treat `.tflite` as a binary asset.

`context/ModelInitContext.tsx` / the Profile screen's "Offline ID model" card
still exist from the old download-based flow; `isModelDownloaded()` /
`downloadModel()` in `local-identify.ts` are now harmless no-ops (the model is
always present) so that code keeps working unchanged and reports "ready"
immediately. Since there's no real download left to show progress for, it's
fine to simplify/retire that UI later.

## Retraining / updating the model

Every time species are added to `constants/catalog.ts`:

1. Re-run Phase 1 (`scripts/pull_inat_dataset.py --species <new-ids>`).
2. Re-run `scripts/train_classifier.ipynb` on the expanded set.
3. Copy the new `species_id.tflite` + `species_labels.json` in here, replacing
   the old ones, and rebuild the app.

## GPU acceleration

The `react-native-fast-tflite` config plugin bundles CoreML (iOS) and GPU
(Android) delegates. The code uses CPU-only inference (`delegates: []`) for
broad model compatibility. To try CoreML, change `loadTensorflowModel({ url },
[])` to `loadTensorflowModel({ url }, ['core-ml'])` and test on a physical
device.
