# Camera Components

This folder contains camera-related UI components: CameraView (Vision Camera wrapper), FaceOverlay (face detection bounding box overlay), and related camera UI. These components use react-native-vision-camera v4 Frame Processors API.

All camera components are implemented in **Phase 2 (Core AI/ML Engine)

**Architectural Rules:**
- Camera components must handle permission states gracefully (no permission, denied, granted).
- Frame processors must be worklets — do not run JS-thread blocking code in them.
- Always release camera resources on unmount.
