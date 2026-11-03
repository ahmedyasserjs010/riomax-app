import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/apiClient';

const WEBSITE_BASE = 'https://riomax.com.eg';

export const GoogleAuthButton = ({ 
  isRegister = false, 
  buttonTitle,
  compact = false,
  onLoginSuccess 
}: {
  isRegister?: boolean;
  buttonTitle?: string;
  compact?: boolean;
  onLoginSuccess: () => void;
}) => {
  const { colors } = useTheme();
  const { saveAuthData } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const page = isRegister ? 'register' : 'login';
      const websiteUrl = `${WEBSITE_BASE}/${page}?from=app`;
      const redirectUrl = makeRedirectUri({ scheme: 'riomaxapp' });

      // فتح المتصفح الآمن وانتظار الرابط
      const result = await WebBrowser.openAuthSessionAsync(websiteUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        // استخراج الكود من الرابط riomaxapp://auth-success?code=xxx
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (!code) {
          showToast('فشل الحصول على كود التبادل', 'error');
          return;
        }

        // استبدال الكود بالتوكنز الحقيقية عبر API
        const response = await apiClient.post('/auth/app-exchange', { code }) as any;
        const { accessToken, refreshToken } = response.data?.data?.newCredentials || {};

        if (accessToken && refreshToken) {
          await saveAuthData(accessToken, refreshToken);
          showToast(
            isRegister ? 'تم إنشاء الحساب بنجاح!' : 'تم تسجيل الدخول بنجاح!',
            'success'
          );
          onLoginSuccess();
        } else {
          showToast('فشل الحصول على بيانات الدخول', 'error');
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // المستخدم أغلق المتصفح يدوياً — لا نعرض خطأ
      }
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء تسجيل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  };

  const title = buttonTitle || (isRegister ? 'الاستمرار باستخدام Google' : 'تسجيل الدخول باستخدام Google');

  return (
    <TouchableOpacity
      style={[
        compact ? styles.compactButton : styles.button, 
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={handleGoogleAuth}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.content}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
            style={compact ? styles.compactIcon : styles.icon}
          />
          <Text style={[compact ? styles.compactText : styles.text, { color: colors.text }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactButton: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 22,
    height: 22,
  },
  compactIcon: {
    width: 16,
    height: 16,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
