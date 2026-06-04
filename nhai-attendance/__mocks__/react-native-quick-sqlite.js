export const open = jest.fn(() => ({
  executeSql: jest.fn(() => Promise.resolve({ rows: { _array: [], length: 0 } })),
  close: jest.fn(),
}));
