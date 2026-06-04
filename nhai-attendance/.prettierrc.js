// .prettierrc.js
// Prettier code formatting configuration.
// These rules are applied automatically on save (if editor is configured)
// and enforced via lint-staged on every commit.

module.exports = {
  // 2-space indentation — consistent with React Native community convention
  tabWidth: 2,
  // Use spaces, not tabs — ensures consistent rendering across all editors
  useTabs: false,
  // Single quotes for strings — consistent with React Native community convention
  singleQuote: true,
  // Require trailing commas in multi-line constructs — makes git diffs cleaner
  // because adding a new item to a list doesn't change the previous last line
  trailingComma: 'all',
  // Print width — not a hard limit, but Prettier aims to keep lines under this
  printWidth: 100,
  // Always include parentheses around arrow function parameters for consistency
  // e.g. (x) => x  NOT  x => x
  arrowParens: 'always',
  // Semicolons at end of statements — explicit is better than implicit
  semi: true,
  // Bracket spacing in object literals: { foo: bar } NOT {foo: bar}
  bracketSpacing: true,
  // JSX: put closing bracket on same line — more compact for React Native components
  jsxBracketSameLine: false,
  // End of line — LF (Unix) even on Windows — prevents mixed line endings in git
  endOfLine: 'lf',
};
