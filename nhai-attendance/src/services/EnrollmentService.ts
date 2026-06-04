import {
  runFaceEmbeddingInference,
  preprocessImageForInference,
  averageEmbeddings,
  l2Normalize,
  embeddingToBase64,
  evaluateFaceQuality,
  type FaceDetectionResult,
} from '@ml/faceRecognition/index';
import { createWorker, updateWorkerFaceEmbedding } from '@db/repositories/workers.repository';
import { registerDevice } from '@db/repositories/devices.repository';
import { logEvent } from '@db/repositories/auditLogs.repository';
import { getCurrentDeviceFingerprint } from './DeviceTrustService';
import { SecurityService } from './SecurityService';

import type { WorkerEnrollmentInput } from '@/types/worker.types';

import DeviceInfo from 'react-native-device-info';

// Module-level storage for enrollment frames
// NOT stored in Zustand because Float32Arrays are too large for state management
const enrollmentFrames: Float32Array[] = [];

/**
 * Clears the in-memory enrollment frame buffer.
 * Call this at the start of every new enrollment session.
 */
export function clearEnrollmentFrames(): void {
  enrollmentFrames.length = 0;
}

/**
 * Processes one enrollment capture frame.
 * Called by the camera frame processor for each captured enrollment frame.
 *
 * @param rgbPixels - Raw 112x112 RGB pixel buffer (already aligned and cropped)
 * @param detection - Face detection result for quality assessment
 * @param imageWidth - Source image width in pixels
 * @param imageHeight - Source image height in pixels
 * @returns quality score and whether this frame was accepted
 */
export async function processEnrollmentFrame(
  rgbPixels: Uint8Array,
  detection: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number,
): Promise<{ accepted: boolean; quality: number; totalCaptured: number }> {
  // Evaluate frame quality before spending time on inference
  const quality = evaluateFaceQuality(detection, imageWidth, imageHeight);

  if (quality.score < 60) {
    return { accepted: false, quality: quality.score, totalCaptured: enrollmentFrames.length };
  }

  // Run inference on this frame
  const preprocessed = preprocessImageForInference(rgbPixels);
  const embedding = await runFaceEmbeddingInference(preprocessed);

  // L2-normalize before storage
  const normalizedEmbedding = l2Normalize(embedding.data);
  enrollmentFrames.push(normalizedEmbedding);

  return {
    accepted: true,
    quality: quality.score,
    totalCaptured: enrollmentFrames.length,
  };
}

/**
 * Completes the enrollment process after sufficient frames have been captured.
 * Averages all captured embeddings, encrypts the result, and saves to SQLite.
 *
 * @param workerInput - Worker profile data
 * @returns ID of the newly enrolled worker
 * @throws Error if insufficient frames (< 3 acceptable frames)
 */
export async function finalizeEnrollment(workerInput: WorkerEnrollmentInput): Promise<string> {
  if (enrollmentFrames.length < 3) {
    throw new Error(
      `Insufficient enrollment frames: ${enrollmentFrames.length} captured, minimum 3 required. ` +
        'Ensure adequate lighting and that the worker faces the camera directly.',
    );
  }

  // Average all captured embeddings into one representative embedding
  const averagedEmbedding = averageEmbeddings(enrollmentFrames);

  // Encrypt the embedding before storage
  const encryptedEmbedding = await SecurityService.encryptEmbedding(
    embeddingToBase64(averagedEmbedding),
  );

  // Create worker record
  const worker = await createWorker(workerInput);

  // Store the encrypted embedding
  await updateWorkerFaceEmbedding(worker.id, encryptedEmbedding, '1.0.0-mobilefacenet-int8');

  // Register the enrollment device as primary
  const deviceFingerprint = await getCurrentDeviceFingerprint();
  await registerDevice(
    worker.id,
    deviceFingerprint,
    DeviceInfo.getModel(),
    DeviceInfo.getSystemVersion(),
    true, // isPrimary = true for enrollment device
  );

  // Audit log
  await logEvent(
    'ENROLLMENT_COMPLETED',
    deviceFingerprint,
    { captureCount: enrollmentFrames.length, workerName: workerInput.name },
    worker.id,
    workerInput.worksiteId,
  );

  // Clear frames
  clearEnrollmentFrames();

  return worker.id;
}
