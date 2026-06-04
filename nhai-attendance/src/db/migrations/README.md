# Migrations

Versioned database migration scripts. Each exports up() and down(). Migrations auto-run on startup and are tracked in _migrations table.

Implemented starting in **Phase 2**.

**Rules:** Idempotent. Never modify released migrations. Pattern: v{N}_{description}.ts.
