# Types

Shared TypeScript type definitions by domain. Pure type files only — interfaces, type aliases, and string enums. No runtime code, no functions, no side effects.

Defined in **Phase 1** (stubs), refined in subsequent phases.

**Architectural Rules:**
- Type files must contain ONLY type definitions — no runtime values.
- Prefer interfaces over type aliases for object shapes (enables declaration merging).
- All enums must be string enums for debuggability (not numeric).
