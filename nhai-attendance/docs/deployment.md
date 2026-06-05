# Deployment Guide: NHAI Hackathon Framework

## 1. Development Setup

To run the application locally for development or field attendance demonstration:

**Prerequisites:**

- Node.js >= 18
- React Native CLI environment (Android Studio / Xcode)
- Java JDK 17

**Clone & Setup:**

```bash
git clone <repository_url>
cd nhai-field attendance-project
npm install

# Run the automated setup script to scaffold directories, create the env file, and download the ML model
bash scripts/setup.sh
```

**Start the Metro Bundler:**

```bash
npm start
```

## 2. Building for Demo

To produce a usable application for field attendance presentation, build a Debug APK or run on the iOS simulator.

**Android Debug APK (Recommended for Demo):**

```bash
cd android
./gradlew assembleDebug
cd ..

# The APK will be located at:
# android/app/build/outputs/apk/debug/app-debug.apk

# Install to a connected device or running emulator:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**iOS Simulator (macOS only):**

```bash
cd ios
pod install
cd ..
npx react-native run-ios --simulator "iPhone 14"
```

## 3. Building for Production (Future)

For real-world deployment to NHAI field workers:

**Android Release:**

```bash
cd android
./gradlew assembleRelease
# Requires configuring a release keystore in android/app/build.gradle
```

**iOS Release:**
Use Xcode to Archive the project and distribute via TestFlight.

**AWS Backend:**

```bash
cd aws
sam build
sam deploy --guided
```

## 4. Mock vs. Real AWS Sync

The framework supports two sync paradigms:

- **Mock Sync (Offline Mode):** Enabled by default when `SYNC_ENDPOINT` is not defined in `.env`. The `OfflineSyncService` simulates network latency, processes the Sync Queue, marks records as `is_synced = 1`, and logs the payload. This proves the offline-first queue architecture works perfectly without requiring an internet connection during a live presentation.
- **AWS Sync (Production Mode):** Enabled when `SYNC_ENDPOINT` is a valid `https://` URL. The app will securely POST the JSON payload to the AWS API Gateway.

## 5. Environment Variables Reference

A `.env.example` file is provided in the repository. Copy it to `.env` (handled automatically by `setup.sh`).

| Variable               | Description                                                          | Valid Values                  | Default      |
| ---------------------- | -------------------------------------------------------------------- | ----------------------------- | ------------ |
| `SYNC_ENDPOINT`        | The AWS API Gateway endpoint URL. Leave blank for offline sync queue.         | `https://*.amazonaws.com/...` | `""` (Empty) |
| `API_KEY`              | Optional authorization key for the API Gateway.                      | Any string                    | `""` (Empty) |
| `ENABLE_MOCK_SYNC`     | Forces the OfflineSyncService even if an endpoint is provided.          | `true`, `false`               | `true`       |
| `MINIMUM_TRUST_SCORE`  | The baseline 0-100 score required to achieve `AUTHENTICATED` status. | `0` - `100`                   | `75`         |
| `FACE_MATCH_THRESHOLD` | The cosine similarity boundary for face recognition.                 | `0.0` - `1.0`                 | `0.70`       |
| `SUPERVISOR_PIN`       | The fallback PIN to bypass ML verification (Demo only).              | `1000` - `9999`               | `1234`       |
