# Hooks

Custom React hooks bridging UI components and backend services/stores. Each hook focuses on a single concern: camera, location, face recognition, liveness, trust scoring, sync, network state, or audit logging.

Implemented across multiple phases as underlying services are built.

**Architectural Rules:**
- Follow React's Rules of Hooks (no conditional calls).
- Compose from Zustand stores and service modules — no business logic directly.
- All hooks must have proper cleanup in useEffect return functions.
