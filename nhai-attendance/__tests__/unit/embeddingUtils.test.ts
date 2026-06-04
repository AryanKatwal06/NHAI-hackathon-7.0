import {
  l2Normalize, cosineSimilarity, averageEmbeddings,
  similarityToTrustScore, embeddingToBase64, base64ToEmbedding,
} from '@ml/faceRecognition/embeddingUtils';
import { FACE_EMBEDDING_DIMENSION, FACE_MATCH_THRESHOLD } from '@constants/face.constants';

describe('l2Normalize', () => {
  it('should produce a unit vector from a non-unit vector', () => {
    const input = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(1.0);
    const normalized = l2Normalize(input);
    const norm = Math.sqrt(normalized.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeCloseTo(1.0, 5);
  });

  it('should throw for wrong dimension', () => {
    expect(() => l2Normalize(new Float32Array(64))).toThrow('Expected embedding dimension');
  });

  it('should throw for zero-norm vector', () => {
    expect(() => l2Normalize(new Float32Array(FACE_EMBEDDING_DIMENSION))).toThrow('near-zero L2 norm');
  });

  it('should be idempotent — normalizing a normalized vector produces the same vector', () => {
    const input = new Float32Array(FACE_EMBEDDING_DIMENSION);
    input[0] = 1.0; // Unit vector pointing along first dimension
    const once  = l2Normalize(input);
    const twice = l2Normalize(once);
    for (let i = 0; i < FACE_EMBEDDING_DIMENSION; i++) {
      expect(twice[i]).toBeCloseTo(once[i] ?? 0, 5);
    }
  });
});

describe('cosineSimilarity', () => {
  it('should return 1.0 for identical vectors', () => {
    const v = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0);
    v[0] = 1.0;
    const similarity = cosineSimilarity(v, v);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  it('should return 0.0 for orthogonal vectors', () => {
    const a = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0);
    const b = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0);
    a[0] = 1.0;
    b[1] = 1.0;
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.0, 5);
  });

  it('should be symmetric — sim(A,B) === sim(B,A)', () => {
    const a = l2Normalize(new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0).map(() => Math.random()));
    const b = l2Normalize(new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0).map(() => Math.random()));
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 5);
  });
});

describe('similarityToTrustScore', () => {
  it('should return 0 for similarity below threshold', () => {
    expect(similarityToTrustScore(FACE_MATCH_THRESHOLD - 0.01)).toBe(0);
    expect(similarityToTrustScore(0.0)).toBe(0);
  });

  it('should return 100 for perfect similarity', () => {
    expect(similarityToTrustScore(1.0)).toBe(100);
  });

  it('should return 50 at threshold', () => {
    const score = similarityToTrustScore(FACE_MATCH_THRESHOLD);
    expect(score).toBe(50);
  });

  it('should scale linearly above threshold', () => {
    // e.g. threshold=0.7, similarity=0.85 -> exactly halfway between threshold and 1.0 -> score 75
    const midPoint = FACE_MATCH_THRESHOLD + (1.0 - FACE_MATCH_THRESHOLD) / 2;
    const score = similarityToTrustScore(midPoint);
    expect(score).toBe(75);
  });

  it('should scale down below threshold', () => {
    const lowerBound = FACE_MATCH_THRESHOLD / 2;
  });
});

describe('averageEmbeddings', () => {
  it('should throw for empty array', () => {
    expect(() => averageEmbeddings([])).toThrow('Cannot average zero embeddings');
  });

  it('should return unit vector for single embedding', () => {
    const e = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0);
    e[0] = 1.0;
    const result = averageEmbeddings([e]);
    const norm = Math.sqrt(Array.from(result).reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1.0, 4);
  });

  it('should produce a vector closer to both inputs than either extreme', () => {
    const a = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0); a[0] = 1.0;
    const b = new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0); b[1] = 1.0;
    const avg = averageEmbeddings([a, b]);
    const simToA = cosineSimilarity(avg, a);
    const simToB = cosineSimilarity(avg, b);
    expect(simToA).toBeGreaterThan(0.5);
    expect(simToB).toBeGreaterThan(0.5);
  });
});

describe('Base64 serialization roundtrip', () => {
  it('should produce identical Float32Array after serialize/deserialize', () => {
    const original = l2Normalize(
      new Float32Array(FACE_EMBEDDING_DIMENSION).fill(0).map((_, i) => i + 1)
    );
    const serialized    = embeddingToBase64(original);
    const deserialized  = base64ToEmbedding(serialized);

    for (let i = 0; i < FACE_EMBEDDING_DIMENSION; i++) {
      expect(deserialized[i]).toBeCloseTo(original[i] ?? 0, 6);
    }
  });
});
