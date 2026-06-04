# Liveness Components

This folder contains UI components for the liveness detection challenge flow: LivenessChallenge (orchestrator), ChallengePrompt (individual challenge display), and animated feedback indicators.

All liveness components are implemented in **Phase 2 (Core AI/ML Engine)

**Architectural Rules:**
- Challenge animations must use react-native-reanimated worklets for 60fps performance.
- Challenge UI must be accessible and provide clear visual + text instructions.
- Timer displays must be accurate to within 100ms.
