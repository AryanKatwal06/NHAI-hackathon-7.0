// jest.config.js
// Jest test runner configuration for React Native TypeScript project.
// Unit and integration tests run with Jest.
// E2E tests (Detox) are configured separately in Phase 10.

module.exports = {
  // Use the React Native Jest preset — handles JSX transform, module mocking
  preset: 'react-native',
  // Root directory for test discovery
  rootDir: '.',
  // Where to find test files
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.test.ts',
    '<rootDir>/__tests__/unit/**/*.test.tsx',
    '<rootDir>/__tests__/integration/**/*.test.ts',
    '<rootDir>/__tests__/integration/**/*.test.tsx',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],
  // Module name mapper mirrors babel.config.js path aliases so imports resolve in tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@ml/(.*)$': '<rootDir>/src/ml/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '\\.tflite$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-config$': '<rootDir>/__mocks__/react-native-config.js',
    '^react-native-geolocation-service$': '<rootDir>/__mocks__/react-native-geolocation-service.js',
    '^react-native-encrypted-storage$': '<rootDir>/__mocks__/react-native-encrypted-storage.js',
    '^react-native-device-info$': '<rootDir>/__mocks__/react-native-device-info.js',
    '^react-native-quick-sqlite$': '<rootDir>/__mocks__/react-native-quick-sqlite.js',
    '^react-native-keychain$': '<rootDir>/__mocks__/react-native-keychain.js',
  },
  // Transform TypeScript files using Babel with the project's babel config
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // Do NOT transform these large packages — they're pre-compiled
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|zustand|immer|uuid)/)',
  ],
  // Collect coverage from src directory
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/assets/**',
  ],
  // Coverage thresholds — enforced in CI. These will increase phase by phase.
  // Phase 1 sets the baseline: 0%. Phase 10 will set final targets.
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  // Output coverage reports to these formats
  coverageReporters: ['text', 'lcov', 'html'],
  // Verbose test output in CI
  verbose: true,
};
