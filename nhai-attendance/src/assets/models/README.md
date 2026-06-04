# Models

This folder holds ML model files used for on-device inference. The primary model is FaceNet (`.tflite`) for face embedding generation. Models are binary assets registered with Metro bundler via `metro.config.js` and are NOT committed to git — download them using `scripts/download-models.sh`.

This folder is populated in **Phase 2 (Core AI/ML Engine)

**Architectural Rules:**
- Never commit `.tflite` or `.bin` files to git (they are in `.gitignore`).
- Always use the download script to fetch models to ensure version consistency.
- Model files must be referenced via the asset system, not by absolute path.
