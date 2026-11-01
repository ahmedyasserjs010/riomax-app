import { Platform } from 'react-native';

/**
 * Platform-aware secure storage utility.
 * Uses expo-secure-store on native (iOS/Android) and localStorage on web.
 */

let SecureStoreModule: any = null;

if (Platform.OS !== 'web') {
  SecureStoreModule = require('expo-secure-store');
}

/**
 * Sanitize key for SecureStore compatibility.
 * SecureStore allows only alphanumeric characters, '.', '-', and '_'.
 */
const sanitizeKey = (key: string): string => {
  return key ? key.replace(/[^a-zA-Z0-9._-]/g, '_') : 'riomax_default_key';
};

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    const safeKey = sanitizeKey(key);
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(safeKey);
      } catch {
        return null;
      }
    }
    try {
      return await SecureStoreModule.getItemAsync(safeKey);
    } catch (e) {
      console.warn('SecureStore.getItem error:', e);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    const safeKey = sanitizeKey(key);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(safeKey, value);
      } catch {
        console.error('localStorage setItem failed');
      }
      return;
    }
    try {
      await SecureStoreModule.setItemAsync(safeKey, value);
    } catch (e) {
      console.warn('SecureStore.setItem error:', e);
    }
  },

  deleteItem: async (key: string): Promise<void> => {
    const safeKey = sanitizeKey(key);
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(safeKey);
      } catch {
        console.error('localStorage removeItem failed');
      }
      return;
    }
    try {
      await SecureStoreModule.deleteItemAsync(safeKey);
    } catch (e) {
      console.warn('SecureStore.deleteItem error:', e);
    }
  },
};
