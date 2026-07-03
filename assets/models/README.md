# On-Device Species ID Model

The app identifies species offline with a TFLite classifier. The model is **not
bundled and not checked into git** — it is **downloaded once at runtime** and
cached on-device, so the app binary stays small.

## How delivery works (no manual setup)

`context/ModelInitContext.tsx` (`ModelInitProvider`, mounted in
`app/_layout.tsx`) runs after email verification — while the user still has the
connectivity they used to sign in — and calls `downloadModel()` from
`lib/local-identify.ts`. It fetches:

- `INatVision_Small_2_fact256_8bit.tflite` → saved as `species_id.tflite`
- `taxonomy.json`

into `FileSystem.documentDirectory/wildlens-models/`. After that first
download the model works fully offline on every launch. Progress/status is
surfaced in the Profile screen via `useModelInit()`. If the download hasn't
happened yet, `identifyFromPhoto()` falls back to the 5-species list.

This directory only holds this README (and `.gitkeep`) — nothing needs to be
placed here by hand.

## Model source

iNaturalist's public model, release **v25.01.15**:
<https://github.com/inaturalist/model-files/releases>

- Vision model output is a **507-class** vector indexed by `leaf_class_id`.
- `taxonomy.json` is a **JSON array of taxon objects**
  (`{ taxon_id, leaf_class_id, rank_level, name, ... }`); only leaf taxa carry a
  `leaf_class_id`. `lib/local-identify.ts` builds a `leaf_class_id → scientific
  name` map from it, then matches those names against `constants/catalog.ts`.

## Changing the model

To swap in a different classifier (e.g. a WildLens-specific fine-tune):

1. Update `MODEL_DOWNLOAD_URL` / `TAXONOMY_DOWNLOAD_URL` in
   `lib/local-identify.ts`.
2. Make sure the taxonomy maps the model's output indices to scientific names
   present in the catalog. `local-identify.ts` derives input size and dtype
   from the model's own input tensor, so a different input size needs no code
   change.

## GPU acceleration

The `react-native-fast-tflite` config plugin bundles CoreML (iOS) and GPU
(Android) delegates. The code uses CPU-only inference (`delegates: []`) for
broad model compatibility. To try CoreML, change `loadTensorflowModel({ url },
[])` to `loadTensorflowModel({ url }, ['core-ml'])` and test on a physical
device.
