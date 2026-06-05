# NHAI Field Attendance System

A highly resilient, offline-first biometric attendance system built for National Highways Authority of India (NHAI) remote field conditions.

## Architecture Overview

This system is engineered to operate seamlessly in environments with zero or intermittent internet connectivity. It employs a multi-layered trust engine that evaluates biometric, environmental, and behavioral signals to authenticate field workers locally.

Key technological pillars include:
- **Offline-First Storage**: Local persistence using high-performance SQLite (`react-native-quick-sqlite`) ensures the app remains fully functional disconnected.
- **On-Device Machine Learning**: Face recognition and liveness detection execute entirely on-device via TensorFlow Lite, removing the need for server-roundtrips and ensuring sub-second verification.
- **Asynchronous Sync Queue**: All attendance records and audit logs are queued locally and automatically synchronized with the AWS backend when network conditions permit.
- **Hardware-Backed Security**: Encrypted biometric embeddings and secure keychain integration protect worker data at rest.

## Core Capabilities

### 1. Advanced Biometric Pipeline
- **Face Detection & Recognition**: Utilizes `MobileFaceNet` (Int8 quantized) for high-accuracy, low-latency facial embeddings.
- **Interactive Liveness Detection**: Combats presentation attacks (spoofing) using dynamic, randomized challenges (e.g., directed eye blinks, head movement tracking) via ML Kit face landmarks.

### 2. Multi-Signal Trust Score Engine
Authentication isn't binary. The system computes a composite **Trust Score (0-100)** aggregating five independent signals:
1. **Face Match**: Cosine similarity against the encrypted enrollment embedding.
2. **Liveness**: Compliance with randomized anti-spoofing challenges.
3. **Device Trust**: Fingerprinting to ensure the login originates from a recognized, authorized device.
4. **Behavioral Anomalies**: Circular statistical analysis of historical login times to flag unusual activity patterns.
5. **Location Verification**: Haversine distance validation against configured worksite geofences.

### 3. Signal Consensus Engine
A deterministic consensus algorithm evaluates the harmony between trust signals. If high-confidence signals contradict (e.g., a perfect face match occurring on an unrecognized device outside the worksite), the system downgrades the authentication attempt to `FLAGGED` for supervisor review, actively preventing proxy and GPS spoofing attacks.

### 4. Background Synchronization
A resilient sync service continuously monitors network state. When connectivity is established, the queue flushes pending authentication records, device telemetry, and audit logs to the AWS cloud infrastructure with automatic exponential backoff for failed transmissions.

## Getting Started

### Prerequisites
- React Native CLI environment configured (Android SDK / Xcode)
- Node.js 18+
- Yarn or npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   Create a `.env` file based on `.env.example` with the necessary worksite and AWS credentials.
3. Start the Metro bundler:
   ```bash
   npm start
   ```
4. Run the application:
   ```bash
   npm run android
   # or
   npm run ios
   ```

## Documentation

For deep dives into the system design, refer to the `docs/` directory:
- [Architecture & Trust Engine](docs/architecture.md)
- [Database Schema](docs/database.md)
- [Security & Cryptography](docs/security.md)

## Security Compliance

This system adheres to strict data minimization principles. Raw biometric images are never stored or transmitted; only one-way cryptographic embeddings are retained. All local storage is encrypted, and network transmission requires TLS 1.3.
