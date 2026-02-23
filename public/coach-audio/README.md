# Static Coach Audio

Place your pre-generated audio clips in this folder and register them in `manifest.json`.

## File layout example

- `public/coach-audio/encourage/enc-001.mp3`
- `public/coach-audio/encourage/enc-002.mp3`
- `public/coach-audio/roast/roast-001.mp3`
- `public/coach-audio/freeform/encourage-free-001.mp3`
- `public/coach-audio/exercise/barbell-bench-press.mp3`

## Manifest format

```json
{
  "modes": {
    "encourage": {
      "periodic": [
        {
          "id": "enc-001",
          "line": "Strong set. Keep your breathing steady and your form clean.",
          "file": "encourage/enc-001.mp3"
        }
      ],
      "freeform": [
        {
          "id": "enc-free-001",
          "line": "Keep your tempo smooth and stay focused.",
          "file": "freeform/encourage-free-001.mp3"
        }
      ]
    },
    "roast": {
      "periodic": [
        {
          "id": "roast-001",
          "line": "No autopilot. Move the weight like you mean it.",
          "file": "roast/roast-001.mp3"
        }
      ],
      "freeform": []
    }
  },
  "exerciseReadouts": {
    "default": {
      "line": "Next exercise is on your screen.",
      "file": "exercise/default-readout.mp3"
    },
    "byExercise": {
      "Barbell Bench Press": {
        "line": "Barbell bench press. Keep your shoulder blades pinned.",
        "file": "exercise/barbell-bench-press.mp3"
      }
    }
  }
}
```

## Performance notes

- Keep clips short (roughly 1-4 seconds).
- Use mono speech encoding (around 32-48 kbps).
- Clips are loaded on demand, not at initial page load.
