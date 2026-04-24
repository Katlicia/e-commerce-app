// Platform-specific storage is injected via configureStorage() at app startup.
// Web: localStorage  |  Mobile: @react-native-async-storage (sync-compatible shim)
// Default to localStorage in browser so the store initializes correctly before configureStorage is called.
let _storage =
  typeof localStorage !== "undefined"
    ? {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, val) => localStorage.setItem(key, val),
        removeItem: (key) => localStorage.removeItem(key),
      }
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export const configureStorage = (impl) => {
  _storage = impl;
};

export const storage = {
  getItem: (key) => _storage.getItem(key),
  setItem: (key, value) => _storage.setItem(key, value),
  removeItem: (key) => _storage.removeItem(key),
};
