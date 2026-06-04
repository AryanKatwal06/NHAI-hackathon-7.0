export default {
  getUniqueId: jest.fn(() => Promise.resolve('mock-device-id')),
  getSystemVersion: jest.fn(() => '1.0'),
  getBrand: jest.fn(() => 'mock-brand'),
  getModel: jest.fn(() => 'mock-model'),
  isEmulator: jest.fn(() => Promise.resolve(false)),
  hasGms: jest.fn(() => Promise.resolve(true)),
  isLocationEnabled: jest.fn(() => Promise.resolve(true)),
};
