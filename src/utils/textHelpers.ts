import { Linking, Alert } from 'react-native';

/**
 * Escapes HTML special characters to prevent HTML injection and XSS
 */
export const escapeHtml = (str: string | number | null | undefined): string => {
  const s = String(str ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Safely opens a URL with support check and error handling
 */
export const safeOpenURL = async (url: string, fallbackMessage?: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert('تنبيه', fallbackMessage || 'لا يمكن فتح هذا الرابط على جهازك');
      return false;
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert('خطأ', fallbackMessage || 'حدث خطأ أثناء فتح الرابط');
    return false;
  }
};
