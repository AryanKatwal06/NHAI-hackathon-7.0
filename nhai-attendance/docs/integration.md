# Integration Guide: Datalake 3.0 Module

This guide provides step-by-step instructions for the NHAI development team to integrate the offline, multi-signal attendance module into the existing Datalake 3.0 React Native application.

The NHAI Hackathon module is fully self-contained. It requires no modifications to existing Datalake screens; it simply needs to be added as a feature module to the navigation stack.

## 1. Integration Overview

The module provides its own SQLite database, ML pipeline, and React Native UI. When launched, it handles worker enrollment and authentication locally. Once network connectivity is established, it syncs authentication logs (without biometric data) to the backend.

## 2. Dependency Installation

The module requires the following dependencies to be added to Datalake 3.0's `package.json`. Use the exact versions below to guarantee compatibility:

```bash
npm install react-native-vision-camera@^4.0.0
npm install react-native-fast-tflite@latest
npm install react-native-quick-sqlite@latest
npm install react-native-keychain@^9.0.0
npm install react-native-permissions@^4.0.0
npm install react-native-geolocation-service@^5.3.0
npm install react-native-device-info@^11.0.0
npm install react-native-encrypted-storage@^4.0.0
npm install react-native-reanimated@^3.0.0
npm install react-native-linear-gradient@^2.8.0
npm install react-native-svg@^15.0.0
npm install zustand@^5.0.0
npm install react-native-config@^1.5.0
npm install @react-native-community/netinfo@^11.0.0
```

## 3. Native Configuration Changes

### Android

**`AndroidManifest.xml`**
Ensure the following permissions are present:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

**`android/app/build.gradle`**
Enable Hermes to optimize JS execution and reduce cold start time:

```gradle
project.ext.react = [
    enableHermes: true,
]
```

### iOS

**`Podfile`**
Enable Hermes:

```ruby
use_react_native!(
  :path => config[:reactNativePath],
  :hermes_enabled => true
)
```

**`Info.plist`**
Add the usage descriptions:

```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to verify your identity.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to verify you are at the worksite.</string>
```

## 4. Navigation Integration

Add the `NhaiAttendanceScreens` to the Datalake 3.0 main navigation stack:

```tsx
// In Datalake 3.0's root App.tsx or Navigator:
import { NhaiAttendanceScreens } from 'nhai-hackathon-project-module';

// Add to your Stack.Navigator:
<Stack.Screen
  name="NhaiAttendance"
  component={NhaiAttendanceScreens}
  options={{ headerShown: false }}
/>;
```

## 5. Model File Deployment

The `mobilefacenet.tflite` model must be bundled with the app.

**`metro.config.js`**
Update the asset extensions to package `.tflite` files:

```javascript
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { assetExts },
  } = await getDefaultConfig();
  return {
    resolver: {
      assetExts: [...assetExts, 'tflite'],
    },
  };
})();
```

Place the downloaded model at `src/assets/models/mobilefacenet.tflite`.

## 6. Performance Impact

Integrating this module will have the following measurable impacts on Datalake 3.0:

| Metric                   | Impact                                                      |
| ------------------------ | ----------------------------------------------------------- |
| Bundle size increase     | +~1.5 MB JS bundle                                          |
| APK size increase        | +~2 MB (model file) + ~5 MB (native libraries)              |
| Cold start time increase | +300–500 ms (only when the attendance module is loaded)     |
| RAM usage during auth    | +~80 MB (TFLite runtime + model in memory)                  |
| RAM released after auth  | Model stays in memory to ensure sub-second subsequent auths |

## 7. Step-by-Step Integration Checklist

1. [ ] Add npm dependencies
2. [ ] Run `cd ios && pod install && cd ..`
3. [ ] Add `AndroidManifest.xml` permissions
4. [ ] Add iOS `Info.plist` usage descriptions
5. [ ] Update `metro.config.js` assetExts for `tflite`
6. [ ] Add iOS Keychain Entitlement (for `react-native-keychain`)
7. [ ] Download and place the `mobilefacenet.tflite` model file
8. [ ] Add navigation screen to Stack
9. [ ] Open module and configure a demo worksite in Settings
10. [ ] Test the Enrollment Flow with a real face
11. [ ] Test the Authentication Flow
12. [ ] Test the background Sync Flow
