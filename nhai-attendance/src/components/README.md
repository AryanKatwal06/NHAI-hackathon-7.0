# Components

This folder contains all reusable React Native UI components. Components are organized into subdirectories by domain: `common/` for shared UI primitives, `camera/` for camera-related views, `liveness/` for liveness challenge UI, and `trust/` for trust score display widgets.

Common components are implemented in **Phase 3 (Security, Sync, UI, and Testing)

**Architectural Rules:**
- Every component lives in its own folder with Component.tsx, Component.styles.ts, and index.ts.
- Components must not contain business logic — delegate to hooks and services.
- All components must be typed with React.FC and proper prop interfaces.
