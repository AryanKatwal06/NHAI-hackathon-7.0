# Screens

All application screens. Each in its own folder with .tsx, .styles.ts, and index.ts. Screens are thin composites of components and hooks — no direct business logic.

Implemented in **Phase 3 (Security, Sync, UI, and Testing)

**Architectural Rules:**
- No business logic in screens — use hooks and services.
- Each screen must have a unique testID on its root View for E2E testing.
- Screens should use the theme system for all visual styling.
