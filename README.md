# Boeing 747 Three.js Study

A procedural Three.js Boeing 747-400 model with fixed inspection cameras and a repeatable screenshot harness.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL and use the view buttons, or pass `?view=front`, `?view=side`, `?view=top`, `?view=rear`, or `?view=quarter`.

## Inspect

```bash
npm run render:views
```

The render harness writes deterministic screenshots to `inspection-renders/` so changes can be checked against the same camera angles on every iteration.
