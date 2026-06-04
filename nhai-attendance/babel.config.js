// babel.config.js
// Babel configuration for React Native CLI project.
// IMPORTANT: babel-plugin-module-resolver must mirror EVERY path alias in tsconfig.json.
// If you add a new alias to tsconfig.json, you MUST add it here too or Metro will fail to resolve.

module.exports = {
  presets: [
    // React Native preset handles JSX transform, flow stripping, and common transforms
    'module:@react-native/babel-preset',
  ],
  plugins: [
    // babel-plugin-module-resolver enables path alias resolution.
    // This is the Babel-side counterpart to tsconfig.json "paths" config.
    // Metro uses Babel to transform files, so this is what actually resolves @/utils/foo
    // at runtime. The tsconfig.json "paths" only helps the TypeScript compiler for type checking.
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@store': './src/store',
          '@ml': './src/ml',
          '@db': './src/db',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@types': './src/types',
          '@theme': './src/theme',
          '@api': './src/api',
          '@assets': './src/assets',
        },
      },
    ],
    // react-native-reanimated/plugin MUST be listed last in the plugins array.
    // This is a hard requirement from the Reanimated library.
    // If it is not last, worklets will not compile correctly and you will get
    // cryptic "worklet" errors at runtime.
    'react-native-reanimated/plugin',
  ],
};
