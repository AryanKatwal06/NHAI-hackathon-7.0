# Utilities

Pure utility functions: crypto (hashing, AES-256), validation (Zod schemas), formatting (dates/numbers/strings), geometry (GPS distance), logging (dev-only), and performance timing.

Implemented across **Phases 2-8**.

**Architectural Rules:**
- All utility functions must be pure (no side effects except the logger).
- Every function must have explicit TypeScript parameter and return types.
- The logger must be completely stripped from production builds.
