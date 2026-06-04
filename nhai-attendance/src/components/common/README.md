# Common Components

This folder contains shared, reusable UI primitives used across multiple screens: Button, Card, LoadingOverlay, StatusBadge, and Typography. These are the building blocks of the application's design system.

All common components are implemented in **Phase 3 (Security, Sync, UI, and Testing)

**Architectural Rules:**
- Each component must accept a `testID` prop for Detox E2E testing.
- Styles must use the theme tokens from `@theme/` — no hardcoded colors or spacing values.
- Components should be pure (no side effects) and fully controlled by props.
