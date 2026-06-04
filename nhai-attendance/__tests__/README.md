# Tests

All test suites: unit, integration, and E2E (Detox). Unit and integration tests use Jest + @testing-library/react-native. E2E tests use Detox on real devices/emulators.

Created in **Phase 10** (Testing & QA).

**Architectural Rules:**
- Test files must follow the naming pattern `*.test.ts` or `*.test.tsx`.
- Unit tests must not depend on external services or the database.
- Integration tests may use an in-memory SQLite database.
- E2E tests run on actual device/emulator and test complete user flows.
