# Scripts

Shell scripts for dev workflow: one-command setup, ML model downloads, type generation.

Maintained throughout all phases.

**Architectural Rules:**
- Scripts must be idempotent — running them twice must not cause errors.
- All scripts must check for prerequisites before executing.
- Scripts must provide clear output indicating success or failure.
