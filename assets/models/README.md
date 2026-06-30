# On-Device Species ID Model

The app uses a TFLite model for offline species identification. The model files are not
checked into git (too large). Follow these steps to set them up before running a build.

## Quickstart

Download the public iNaturalist 500-taxa model from their GitHub releases:

```
https://github.com/inaturalist/model-files/releases
```

You need two files:
- `small_inception_tf1.tflite` → rename to `species_id.tflite`, place here
- `taxonomy.json` — place here as-is

Expected taxonomy format: a JSON array of scientific names, index-aligned with model outputs:
```json
["Plantae", "Animalia", "Carnegiea gigantea", ...]
```

If the iNat taxonomy.json uses a different format (e.g. `{ "labels": [...] }`), the
`loadModel()` function in `lib/local-identify.ts` handles both.

## Without the model files

The app works without these files — it gracefully falls back to the 5-species hardcoded
list when the model is unavailable. Users can also trigger a download at runtime via
`downloadModel()` from `lib/local-identify.ts`.

## Changing the model

To use a different TFLite model (e.g. a fine-tuned version for WildLens's 163 species):
1. Replace `species_id.tflite` with your model
2. Update `taxonomy.json` to match your model's output class ordering
3. If your model uses a different input size (not 224×224), update `local-identify.ts`

## GPU acceleration

The app bundles CoreML (iOS) and GPU (Android) delegates via the `react-native-fast-tflite`
config plugin. By default the code uses CPU-only inference (`delegates: []`) for broadest
model compatibility. To enable CoreML delegate, change `loadTensorflowModel({ url }, [])`
to `loadTensorflowModel({ url }, ['core-ml'])` in `lib/local-identify.ts` — then test
on a physical device to confirm your model is CoreML-compatible.
