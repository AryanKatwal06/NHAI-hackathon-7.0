# Constants

This folder contains all application-wide constant values organized by domain. Constants are pure TypeScript objects with `as const` assertions for type safety. They serve as the single source of truth for thresholds, weights, configuration values, and magic numbers used throughout the application.

Constants are fully implemented in **Phase 1** (this phase). They are referenced by all subsequent phases.

**Architectural Rules:**
- All constants must use `as const` assertions for literal type inference.
- Constants must not import from any module outside this folder (except react-native-config for env overrides).
- Every constant must have a comment explaining its purpose and valid range.
