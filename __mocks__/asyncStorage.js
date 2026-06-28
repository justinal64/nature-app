const store = {};

const AsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(store[key] ?? null)),
  setItem: jest.fn((key, value) => { store[key] = value; return Promise.resolve(); }),
  removeItem: jest.fn((key) => { delete store[key]; return Promise.resolve(); }),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => { Object.keys(store).forEach((k) => delete store[k]); return Promise.resolve(); }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
  flushGetRequests: jest.fn(),
  mergeItem: jest.fn(() => Promise.resolve()),
  multiMerge: jest.fn(() => Promise.resolve()),
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
