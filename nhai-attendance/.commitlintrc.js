// .commitlintrc.js
// Enforces Conventional Commits specification on every commit message.
// Format: <type>(<scope>): <description>
// Examples:
//   feat(ml): add MobileFaceNet embedding generation
//   fix(db): resolve SQLite migration failure on Android
//   docs(readme): update installation instructions
//   test(liveness): add unit tests for blink detector
//   chore(deps): update react-native-vision-camera to v4.1.0
//
// Valid types: feat, fix, docs, style, refactor, test, chore, perf, ci, revert
// Valid scopes: ml, db, sync, security, ui, navigation, store, api, liveness, face, trust, device, location

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce the valid types list above
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
    ],
    // Subject line must not exceed 100 characters
    'subject-max-length': [2, 'always', 100],
    // Subject must not start with a capital letter (lower-case-start)
    'subject-case': [2, 'always', 'lower-case'],
    // Scope must be one of the valid scopes
    'scope-enum': [
      1, // warn, not error, in case a new scope is needed
      'always',
      ['ml', 'db', 'sync', 'security', 'ui', 'navigation', 'store', 'api',
       'liveness', 'face', 'trust', 'device', 'location', 'camera', 'utils',
       'theme', 'hooks', 'services', 'types', 'constants', 'docs', 'deps'],
    ],
  },
};
