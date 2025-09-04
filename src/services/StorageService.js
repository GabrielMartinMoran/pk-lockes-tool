/**
 * Storage abstraction layer for easy switching between storage mechanisms
 * Currently implements LocalStorage but can be extended for other storage types
 */

const StorageService = (() => {
  const STORAGE_PREFIX = 'pokemon_lockes_';
  
  // Private methods
  const getKey = (key) => `${STORAGE_PREFIX}${key}`;
  
  const serialize = (data) => {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error serializing data:', error);
      return null;
    }
  };
  
  const deserialize = (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error deserializing data:', error);
      return null;
    }
  };
  
  // Public API
  const get = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(getKey(key));
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return defaultValue;
    }
  };
  
  const set = (key, value) => {
    try {
      const serializedValue = serialize(value);
      if (serializedValue !== null) {
        localStorage.setItem(getKey(key), serializedValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting to storage:', error);
      return false;
    }
  };
  
  const remove = (key) => {
    try {
      localStorage.removeItem(getKey(key));
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  };
  
  const clear = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_PREFIX)
      );
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  };
  
  const exists = (key) => {
    try {
      return localStorage.getItem(getKey(key)) !== null;
    } catch (error) {
      console.error('Error checking storage:', error);
      return false;
    }
  };
  
  // Get all keys with our prefix
  const getAllKeys = () => {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  };
  
  return {
    get,
    set,
    remove,
    clear,
    exists,
    getAllKeys
  };
})();

export default StorageService;
