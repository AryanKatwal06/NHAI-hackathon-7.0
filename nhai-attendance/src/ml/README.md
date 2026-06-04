# Machine Learning

On-device ML pipelines: face recognition (FaceNet/TFLite) and liveness detection (MediaPipe Face Mesh). All inference runs entirely on-device, zero network calls for ML.

Face recognition: **Phase 2**. Liveness detection: **Phase 2**.

**Architectural Rules:**
- All ML inference must run on-device — zero network calls.
- Models loaded lazily (not at app startup) to minimize cold start time.
- Preprocessing must match the model's training pipeline exactly.
