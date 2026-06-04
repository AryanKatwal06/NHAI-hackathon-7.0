# Store

Zustand v5 state management. Separate store per domain: auth, enrollment, sync, settings. Zero boilerplate, immer middleware for complex updates, persist middleware for survival across restarts.

Implemented across **Phases 2-9**.

**Architectural Rules:**
- Separate `create()` call per store — no monolithic store.
- Use immer middleware for nested state updates.
- Persist middleware must be used for stores that need to survive app restart.
