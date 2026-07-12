/**
 * Safe LocalStorage wrappers with try-catch fallback
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.warn('Error reading from localStorage', e);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Error writing to localStorage', e);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Error removing from localStorage', e);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.warn('Error clearing localStorage', e);
      return false;
    }
  }
};
