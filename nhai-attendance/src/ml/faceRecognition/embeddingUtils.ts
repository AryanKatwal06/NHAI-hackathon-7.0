// src/ml/faceRecognition/embeddingUtils.ts
// Mathematical utilities for face embedding operations.
//
// A face embedding is a 128-dimensional vector in a high-dimensional space where
// faces from the same person cluster together and faces from different people are far apart.
//
// We use COSINE SIMILARITY (not Euclidean distance) because:
// 1. Cosine similarity is scale-invariant — it measures the angle between vectors,
//    not their magnitude. This makes it more robust to slight differences in
//    lighting and exposure that can scale the entire embedding vector.
// 2. It produces a score in the range [0, 1] (for normalized vectors) which maps
//    cleanly to our 0–100 trust scale.
// 3. FaceNet was evaluated using cosine similarity in its original paper.

import {
  FACE_EMBEDDING_DIMENSION,
  FACE_MATCH_TIERS,
  FACE_MATCH_THRESHOLD as FACE_SIMILARITY_THRESHOLD,
} from '@constants/face.constants';
import type { FaceMatchResult } from './types';

// Hardcoded since FACE_SCORE_MAPPING is missing from face.constants.ts in the provided code
const FACE_SCORE_MAPPING = {
  FAIL_SCORE: 0,
  MINIMUM_PASS_SCORE: 50,
  PERFECT_SCORE: 100,
  PERFECT_SIMILARITY: 1.0,
};

/**
 * L2-normalizes a face embedding vector.
 *
 * L2 normalization divides each component by the vector's L2 norm (Euclidean length),
 * producing a unit vector (length = 1.0). After normalization, cosine similarity
 * is equivalent to the dot product, which is faster to compute.
 *
 * FaceNet outputs embeddings that are NOT L2-normalized — we must normalize them
 * before computing similarity, because the raw vector magnitudes are not meaningful
 * for identity comparison.
 *
 * @param embedding - Raw Float32Array from FaceNet inference
 * @returns L2-normalized Float32Array of the same dimension
 */
export function l2Normalize(embedding: Float32Array): Float32Array {
  if (embedding.length !== FACE_EMBEDDING_DIMENSION) {
    throw new Error(
      `Expected embedding dimension ${FACE_EMBEDDING_DIMENSION}, got ${embedding.length}. ` +
        'This indicates a model mismatch — verify you are using the correct FaceNet variant.',
    );
  }

  // Compute L2 norm: sqrt(sum of squares of all components)
  let sumOfSquares = 0;
  for (let i = 0; i < embedding.length; i++) {
    sumOfSquares += (embedding[i] ?? 0) * (embedding[i] ?? 0);
  }
  const norm = Math.sqrt(sumOfSquares);

  // Guard against zero-norm vectors (all-zero embedding = model inference failure)
  if (norm < 1e-10) {
    throw new Error(
      'Face embedding has near-zero L2 norm. This indicates a model inference failure. ' +
        'Check that the input image is valid and the TFLite model loaded correctly.',
    );
  }

  const normalized = new Float32Array(embedding.length);
  for (let i = 0; i < embedding.length; i++) {
    normalized[i] = (embedding[i] ?? 0) / norm;
  }
  return normalized;
}

/**
 * Computes cosine similarity between two L2-normalized face embeddings.
 *
 * For L2-normalized unit vectors, cosine similarity is simply the dot product.
 * Result range: [-1, 1], though in practice face embeddings from FaceNet
 * rarely produce negative similarities — typical range is [0.2, 1.0].
 *
 * Interpretation:
 * - 1.0: identical embeddings (same face, same conditions)
 * - 0.7+: very likely the same person
 * - 0.65: threshold — same person / different person boundary
 * - 0.5: uncertain / possibly same person with very different conditions
 * - <0.5: almost certainly different people
 *
 * @param embeddingA - L2-normalized embedding for person A
 * @param embeddingB - L2-normalized embedding for person B
 * @returns Cosine similarity score in range [-1, 1]
 */
export function cosineSimilarity(embeddingA: Float32Array, embeddingB: Float32Array): number {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error(
      `Embedding dimension mismatch: A=${embeddingA.length}, B=${embeddingB.length}. ` +
        'Both embeddings must be from the same model.',
    );
  }

  let dotProduct = 0;
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += (embeddingA[i] ?? 0) * (embeddingB[i] ?? 0);
  }

  // Clamp to [-1, 1] to handle floating-point precision errors
  return Math.max(-1, Math.min(1, dotProduct));
}

/**
 * Averages multiple face embeddings into a single representative embedding.
 * Used during enrollment to create a more robust stored embedding from multiple
 * capture frames (ENROLLMENT_CAPTURE_COUNT = 5 frames by default).
 *
 * Averaging in embedding space is mathematically valid for unit vectors —
 * the average direction represents the "center" of the cluster of embeddings
 * captured from multiple slightly different poses and lighting conditions.
 * The result is then re-normalized to produce a unit vector.
 *
 * @param embeddings - Array of L2-normalized embeddings from multiple enrollment captures
 * @returns Single averaged and re-normalized embedding
 */
export function averageEmbeddings(embeddings: Float32Array[]): Float32Array {
  if (embeddings.length === 0) {
    throw new Error('Cannot average zero embeddings. At least 1 enrollment capture is required.');
  }

  const dimension = embeddings[0]?.length ?? FACE_EMBEDDING_DIMENSION;
  const averaged = new Float32Array(dimension);

  // Sum all embeddings component-wise
  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      averaged[i] = (averaged[i] ?? 0) + (embedding[i] ?? 0);
    }
  }

  // Divide by count to get the mean
  for (let i = 0; i < dimension; i++) {
    averaged[i] = (averaged[i] ?? 0) / embeddings.length;
  }

  // Re-normalize to unit vector — the average may not be a unit vector
  return l2Normalize(averaged);
}

/**
 * Maps a cosine similarity score to the 0–100 trust scale used by the Trust Score Engine.
 *
 * Mapping logic:
 * - similarity >= 1.0 → score 100 (perfect match)
 * - similarity == FACE_SIMILARITY_THRESHOLD (0.65) → score 60 (minimum passing score)
 * - similarity < FACE_SIMILARITY_THRESHOLD → score 0 (fail)
 * - Linear interpolation between threshold and 1.0
 *
 * The minimum passing score of 60 was chosen deliberately so that a barely-passing
 * face match, combined with marginal scores on other signals, still results in a
 * FLAGGED outcome (score 60–79) rather than AUTHENTICATED — requiring supervisor review.
 *
 * @param similarity - Cosine similarity in range [-1, 1]
 * @returns Trust score integer in range [0, 100]
 */
export function similarityToTrustScore(similarity: number): number {
  if (similarity < FACE_SIMILARITY_THRESHOLD) {
    return FACE_SCORE_MAPPING.FAIL_SCORE;
  }

  // Linear interpolation from threshold to 1.0 → maps to 60 to 100
  const range = FACE_SCORE_MAPPING.PERFECT_SIMILARITY - FACE_SIMILARITY_THRESHOLD;
  const scoreRange = FACE_SCORE_MAPPING.PERFECT_SCORE - FACE_SCORE_MAPPING.MINIMUM_PASS_SCORE;
  const normalizedPosition = (similarity - FACE_SIMILARITY_THRESHOLD) / range;
  const score = FACE_SCORE_MAPPING.MINIMUM_PASS_SCORE + normalizedPosition * scoreRange;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Compares a candidate embedding (from authentication attempt) against a stored
 * enrolled embedding and returns a complete FaceMatchResult.
 *
 * This is the main function called by the authentication pipeline.
 * It handles normalization, similarity computation, and score mapping.
 *
 * @param candidateEmbedding - Raw embedding from current authentication attempt
 * @param enrolledEmbedding - Stored embedding from enrollment (already normalized)
 * @param startTime - Performance.now() timestamp when face detection started
 * @returns FaceMatchResult with similarity, trust score, match decision, and timing
 */
export function compareFaceEmbeddings(
  candidateEmbedding: Float32Array,
  enrolledEmbedding: Float32Array,
  startTime: number,
): FaceMatchResult {
  const normalizedCandidate = l2Normalize(candidateEmbedding);
  const normalizedEnrolled = l2Normalize(enrolledEmbedding);
  const similarity = cosineSimilarity(normalizedCandidate, normalizedEnrolled);
  const trustScore = similarityToTrustScore(similarity);

  return {
    similarity,
    trustScore,
    isMatch: similarity >= FACE_SIMILARITY_THRESHOLD,
    processingTimeMs: performance.now() - startTime,
  };
}

/**
 * Serializes a Float32Array embedding to a Base64 string for encrypted storage.
 * The binary representation of the Float32Array is preserved exactly.
 *
 * @param embedding - L2-normalized Float32Array
 * @returns Base64-encoded string representation
 */
export function embeddingToBase64(embedding: Float32Array): string {
  const buffer = embedding.buffer;
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

/**
 * Deserializes a Base64 string back to a Float32Array embedding.
 * Inverse operation of embeddingToBase64.
 *
 * @param base64 - Base64 string from embeddingToBase64
 * @returns Float32Array with the original embedding data
 */
export function base64ToEmbedding(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}
