# Coach V2 Static Audio Setup

This project now uses static coach audio files served from `public/coach-audio/`.

No backend API is required for coach voice playback.

## 1) Add clips

Put your pre-generated audio clips under:

- `public/coach-audio/encourage/`
- `public/coach-audio/roast/`
- `public/coach-audio/freeform/`
- `public/coach-audio/exercise/` (optional)

## 2) Register clips in manifest

Edit `public/coach-audio/manifest.json`:

- `modes.encourage.periodic`
- `modes.encourage.freeform`
- `modes.roast.periodic`
- `modes.roast.freeform`
- `exerciseReadouts.default` or `exerciseReadouts.byExercise` (optional)

See `public/coach-audio/README.md` for full schema examples.

## 3) Performance defaults

- Audio is loaded lazily by URL at play time.
- Audio player uses `preload="none"`.
- No clip files are imported into JS, so initial app bundle size stays low.

## 4) Deploy

Deploy as usual with GitHub Pages. `public/coach-audio/` assets are included in the static build.
