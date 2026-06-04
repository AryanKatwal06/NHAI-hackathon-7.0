# Database

This folder contains the SQLite database layer: connection initialization, schema definitions, migrations, and repository classes. The app uses react-native-quick-sqlite with optional SQLCipher encryption for on-device storage.

Implemented in **Phase 2 (Core AI/ML Engine)

**Architectural Rules:**
- All access through repositories. No raw SQL in screens or services.
- Migrations must be idempotent and versioned sequentially.
- Sensitive data (face embeddings, auth records) must be stored encrypted.
