import { Platform } from 'react-native';

/**
 * Platform-aware secure storage utility.
 * Uses expo-secure-store on native (iOS/Android) and localStorage on web.
 */

let SecureStoreModule: any = null;

if (Platform.OS !== 'web') {
  SecureStoreModule = require('expo-secure-store');
}

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStoreModule.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        console.error('localStorage setItem failed');
      }
      return;
    }
    return SecureStoreModule.setItemAsync(key, value);
  },

  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        console.error('localStorage removeItem failed');
      }
      return;
    }
    return SecureStoreModule.deleteItemAsync(key);
  },
};
