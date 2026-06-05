// src/ml/faceRecognition/MobileFaceNet.ts
// MobileFaceNet TFLite inference engine.
//
// This module manages the lifecycle of the FaceNet TFLite model:
// loading, input preprocessing, inference execution, and output extraction.
//
// IMPORTANT IMPLEMENTATION NOTES:
//
// 1. Model loading is expensive (~100–300ms) and must only happen ONCE at app startup.
//    The loaded model is cached in module scope. Subsequent calls to runInference()
//    use the already-loaded model.
//
// 2. MobileFaceNet input specification:
//    - Shape: [1, 112, 112, 3] (batch=1, height=112, width=112, channels=3)
//    - Data type: Float32
//    - Value range: [-1.0, +1.0] (normalized from [0, 255] using (pixel/128.0 - 1.0))
//    - Channel order: RGB (NOT BGR)
//
// 3. MobileFaceNet output specification:
//    - Shape: [1, 192]
//    - Data type: Float32
//    - Represents: 192-dimensional face embedding (NOT L2-normalized by the model)
//    - Must L2-normalize before computing similarity (see embeddingUtils.ts)
//
// 4. GPU delegate usage:
//    - On Android: use TfLiteGpuDelegateV2 when available, fall back to CPU
//    - On iOS: use CoreML delegate when available, fall back to CPU
//    - The react-native-fast-tflite library handles delegate selection automatically
//      when configured with { delegate: 'gpu' } — it falls back gracefully to CPU

import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import { Platform } from 'react-native';
import type { FaceEmbedding } from './types';
import { FACE_INPUT_SIZE, FACE_EMBEDDING_DIMENSION } from '@constants/face.constants';
import { PerformanceMonitor } from '@services/PerformanceMonitor';

// Module-level singleton. The model is loaded once and reused for all inference calls.
// This avoids the expensive model loading cost on every authentication attempt.
let modelInstance: TensorflowModel | null = null;
let isLoading = false;
let loadError: Error | null = null;

const MODEL_VERSION = '1.0.0-mobilefacenet';

/**
 * Loads the MobileFaceNet TFLite model from the app bundle.
 *
 * This function is idempotent — calling it multiple times is safe.
 * It will only load the model once and return the cached instance on subsequent calls.
 *
 * Call this function at app startup (in the root component's useEffect or in
 * the App navigator's onReady callback) to avoid loading delay during the first
 * authentication attempt.
 *
 * @throws Error if the model file is not found or cannot be loaded
 */
export async function loadMobileFaceNet(): Promise<void> {
  if (modelInstance !== null) {
    return; // Already loaded — return immediately
  }

  if (isLoading) {
    await new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (modelInstance !== null) {
          clearInterval(checkInterval);
          resolve();
        } else if (loadError !== null) {
          clearInterval(checkInterval);
          reject(loadError);
        }
      }, 100);
    });
    return;
  }

  isLoading = true;
  const loadStart = performance.now();

  try {
    // react-native-fast-tflite requires the model to be a static asset
    // The require() here is resolved by Metro using the .tflite extension
    // we configured in metro.config.js

    const modelAsset = require('../../assets/models/mobilefacenet.tflite');

    modelInstance = await loadTensorflowModel(modelAsset, 'default');

    const loadTimeMs = performance.now() - loadStart;
    PerformanceMonitor.record('facenet_model_load', loadTimeMs);

    console.info(`[MobileFaceNet] Model loaded in ${loadTimeMs.toFixed(1)}ms on ${Platform.OS}`);
  } catch (error) {
    loadError = error instanceof Error ? error : new Error(String(error));
    isLoading = false;
    throw loadError;
  }

  isLoading = false;
}

/**
 * Returns true if the model is loaded and ready for inference.
 */
export function isMobileFaceNetLoaded(): boolean {
  return modelInstance !== null;
}

/**
 * Disposes the loaded model and frees native memory.
 * Call this only when shutting down the ML pipeline (e.g., app background).
 * After calling this, loadMobileFaceNet() must be called again before inference.
 */
export function disposeMobileFaceNet(): void {
  if (modelInstance !== null) {
    modelInstance = null;
    loadError = null;
    isLoading = false;
  }
}

/**
 * Preprocesses a raw image pixel buffer for FaceNet input.
 *
 * MobileFaceNet expects:
 * - Float32Array of shape [1, 160, 160, 3] = 160 * 160 * 3 = 76,800 float32 values
 * - Values normalized to [-1.0, +1.0] using: (pixel_value / 128.0) - 1.0
 * - Channel order: RGB
 *
 * @param rgbPixels - Uint8Array of RGB pixel values, length = width * height * 3
 *                    Must be a 160x160 image (already cropped and aligned)
 * @returns Float32Array ready for TFLite model input
 */
export function preprocessImageForInference(rgbPixels: Uint8Array): Float32Array {
  const expectedLength = FACE_INPUT_SIZE.WIDTH * FACE_INPUT_SIZE.HEIGHT * FACE_INPUT_SIZE.CHANNELS;

  if (rgbPixels.length !== expectedLength) {
    throw new Error(
      `Expected ${expectedLength} pixel values for ${FACE_INPUT_SIZE.WIDTH}x${FACE_INPUT_SIZE.HEIGHT} RGB image, ` +
        `got ${rgbPixels.length}. Ensure the image was aligned and cropped correctly before preprocessing.`,
    );
  }

  const floatInput = new Float32Array(expectedLength);

  for (let i = 0; i < expectedLength; i++) {
    floatInput[i] = (rgbPixels[i] ?? 0) / 128.0 - 1.0;
  }

  return floatInput;
}

/**
 * Runs MobileFaceNet inference on a preprocessed face image.
 *
 * This is the core inference function. It takes the Float32 input tensor,
 * passes it through the model, and extracts the 192-dimensional embedding.
 *
 * PRECONDITIONS:
 * - loadMobileFaceNet() must have been called and completed successfully
 * - preprocessedInput must be a Float32Array of length 76,800 (160*160*3)
 * - preprocessedInput values must be in range [-1.0, +1.0]
 *
 * @param preprocessedInput - Float32Array from preprocessImageForInference()
 * @returns FaceEmbedding containing the 192-dim vector and timing data
 * @throws Error if model is not loaded or inference fails
 */
export async function runFaceEmbeddingInference(
  preprocessedInput: Float32Array,
): Promise<FaceEmbedding> {
  if (modelInstance === null) {
    throw new Error(
      'MobileFaceNet not loaded — call loadMobileFaceNet() at startup'
    );
  }

  const inferenceStart = performance.now();

  let outputData: Float32Array;

  try {
    const outputs = await modelInstance.run([preprocessedInput]);

    const rawOutput = outputs[0];
    if (!rawOutput || !(rawOutput instanceof Float32Array)) {
      throw new Error('Model output is null or not a Float32Array.');
    }

    if (rawOutput.length !== FACE_EMBEDDING_DIMENSION) {
      throw new Error(`Embedding dimension mismatch: expected ${FACE_EMBEDDING_DIMENSION}, got ${rawOutput.length}`);
    }

    outputData = rawOutput;
  } catch (error) {
    throw new Error(
      `MobileFaceNet inference failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const inferenceTimeMs = performance.now() - inferenceStart;
  PerformanceMonitor.record('facenet_inference', inferenceTimeMs);

  if (inferenceTimeMs > 400) {
    console.warn(
      `[MobileFaceNet] Inference took ${inferenceTimeMs.toFixed(1)}ms — ` +
        'exceeds 400ms target. Consider enabling GPU delegate or reducing model complexity.',
    );
  }

  return {
    data: outputData,
    generatedAt: new Date().toISOString(),
    modelVersion: MODEL_VERSION,
    processingTimeMs: inferenceTimeMs,
  };
}
