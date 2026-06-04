# Assets

This folder contains all static assets for the application: fonts, images, and ML model files. Assets are organized into subdirectories by type. The `models/` subfolder will hold the FaceNet `.tflite` model file downloaded via the `scripts/download-models.sh` script.

This folder is populated across multiple phases: fonts/images in **Phase 3 (Security, Sync, UI, and Testing)

**Architectural Rules:**
- ML model files (`.tflite`, `.bin`) must NOT be committed to git — they are downloaded via scripts.
- All image assets should be optimized for mobile (< 100KB where possible).
- Font files must be linked to the native projects via `react-native.config.js` if custom fonts are used.
