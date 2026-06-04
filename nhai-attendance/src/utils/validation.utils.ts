// validation.utils.ts — Zod schema validators for runtime data validation.
// Ensures data integrity for worker records, auth attempts, and sync payloads.

import { z } from 'zod';

// ─── WORKER SCHEMAS ──────────────────────────────────────────────────────────

export const WorkerProfileSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(50),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  designation: z.string().max(100).optional(),
  worksiteId: z.string().min(1).optional(),
});

export type ValidatedWorkerProfile = z.infer<typeof WorkerProfileSchema>;

// ─── AUTH RECORD SCHEMAS ─────────────────────────────────────────────────────

export const AuthDecisionSchema = z.enum(['AUTHENTICATED', 'FLAGGED', 'REJECTED', 'PENDING']);

export const TrustSignalsSchema = z.object({
  faceMatch: z.number().min(0).max(100),
  liveness: z.number().min(0).max(100),
  deviceTrust: z.number().min(0).max(100),
  behavioral: z.number().min(0).max(100),
  location: z.number().min(0).max(100),
});

export const AuthRecordSchema = z.object({
  workerId: z.string().min(1),
  employeeId: z.string().min(1),
  worksiteId: z.string().min(1),
  trustScore: z.number().min(0).max(100),
  decision: AuthDecisionSchema,
  signals: TrustSignalsSchema,
  deviceFingerprint: z.string().min(1),
  timestamp: z.string().datetime(),
});

// ─── SYNC PAYLOAD SCHEMAS ────────────────────────────────────────────────────

export const SyncPayloadSchema = z.object({
  authAttemptId: z.string().uuid(),
  workerId: z.string().min(1),
  employeeId: z.string().min(1),
  worksiteId: z.string().min(1),
  trustScore: z.number().min(0).max(100),
  decision: AuthDecisionSchema,
  signals: TrustSignalsSchema,
  timestamp: z.string(),
  deviceFingerprint: z.string(),
});

export const SyncBatchSchema = z.object({
  records: z.array(SyncPayloadSchema).min(1).max(50),
});

// ─── PIN VALIDATION ──────────────────────────────────────────────────────────

export const PinSchema = z
  .string()
  .min(4, 'PIN must be at least 4 digits')
  .max(8, 'PIN must be at most 8 digits')
  .regex(/^\d+$/, 'PIN must contain only digits');

// ─── GPS COORDINATE SCHEMA ──────────────────────────────────────────────────

export const GpsCoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  timestamp: z.number().optional(),
});

// ─── VALIDATION HELPERS ──────────────────────────────────────────────────────

/**
 * Validates data against a Zod schema. Returns the parsed data or throws.
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validates data against a Zod schema. Returns { success, data, error }.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((i) => i.message).join(', ') };
}

/**
 * Validates an employee ID format (alphanumeric, 3-20 chars).
 */
export function isValidEmployeeId(id: string): boolean {
  return /^[A-Za-z0-9_-]{3,20}$/.test(id);
}

/**
 * Validates that a trust score is in valid range.
 */
export function isValidTrustScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100 && !isNaN(score);
}
