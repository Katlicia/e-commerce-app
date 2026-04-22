// Platform-specific storage is injected via configureStorage() at app startup.
// Web: localStorage  |  Mobile: @react-native-async-storage (sync-compatible shim)
let _storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const configureStorage = (impl) => {
  _storage = impl;
};

export const storage = {
  getItem: (key) => _storage.getItem(key),
  setItem: (key, value) => _storage.setItem(key, value),
  removeItem: (key) => _storage.removeItem(key),
};
