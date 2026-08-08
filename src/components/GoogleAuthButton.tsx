import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Image, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '154055057488-ggm91jkgs2ubqlhr7getnupnkugep2jo.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '154055057488-tg99pb2pcqce50sjr3u58ibu1jauiq4m.apps.googleusercontent.com';

export const GoogleAuthButton = ({ isRegister = false, onLoginSuccess }: { isRegister?: boolean, onLoginSuccess: () => void }) => {
  const { colors } = useTheme();
  const { googleLogin } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({
    scheme: 'riomaxapp',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (request) {
      console.log('📱 Google Auth Redirect URI:', request.redirectUri);
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleSuccess(id_token);
      }
    } else if (response?.type === 'error') {
      showToast('حدث خطأ أثناء الاتصال بجوجل', 'error');
    }
  }, [response]);

  const handleSuccess = async (idToken: string) => {
    setLoading(true);
    try {
      await googleLogin(idToken);
      showToast(isRegister ? 'تم إنشاء الحساب عبر Google بنجاح!' : 'تم تسجيل الدخول عبر Google بنجاح!', 'success');
      onLoginSuccess();
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    promptAsync();
  };



  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handleGoogleAuth}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.content}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} 
            style={styles.icon} 
          />
          <Text style={[styles.text, { color: colors.text }]}>
            {isRegister ? 'الاستمرار باستخدام Google' : 'تسجيل الدخول باستخدام Google'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
