# API

This folder contains the HTTP client layer for communicating with the AWS API Gateway backend (or a mock service for local application testing). All network requests originate from this module. It defines the `awsSync.ts` client for uploading attendance records and downloading worksite configurations, plus `types.ts` for all request/response payload shapes.

This folder is fully implemented in **Phase 3 (Security, Sync, UI, and Testing)

**Architectural Rules:**
- All API calls must go through the centralized Axios client defined here.
- Every request/response must have a corresponding Zod schema for runtime validation.
- No API calls should be made directly from screens or components — always go through `SyncService`.
