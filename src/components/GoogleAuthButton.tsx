import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Image, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as GoogleAuthSession from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

// Web Client ID — نفس اللي في الموقع والـ Backend
const GOOGLE_WEB_CLIENT_ID = '154055057488-ggm91jkgs2ubqlhr7getnupnkugep2jo.apps.googleusercontent.com';

// نقوم بتهيئة المكتبة الأصلية فقط إذا لم نكن على الويب لتجنب أي أخطاء
let GoogleSignin: any = null;
let statusCodes: any = null;
let isErrorWithCode: any = null;

if (Platform.OS !== 'web') {
  const GoogleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleSignInModule.GoogleSignin;
  statusCodes = GoogleSignInModule.statusCodes;
  isErrorWithCode = GoogleSignInModule.isErrorWithCode;

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID, // هذا يخلي signIn يرجع idToken في البيئة الأصلية
  });
} else {
  // إكمال الجلسة مطلوب فقط للويب عند استخدام expo-auth-session
  WebBrowser.maybeCompleteAuthSession();
}

export const GoogleAuthButton = ({ isRegister = false, onLoginSuccess }: { isRegister?: boolean, onLoginSuccess: () => void }) => {
  const { colors } = useTheme();
  const { googleLogin } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // ─── إعداد تسجيل الدخول للويب (Web Platform Flow) ────────────────────────
  const redirectUri = makeRedirectUri({
    scheme: 'riomaxapp',
  });

  const [request, response, promptAsync] = GoogleAuthSession.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  // الاستماع لاستجابة الويب
  useEffect(() => {
    if (Platform.OS === 'web' && response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleSuccess(id_token);
      }
    } else if (Platform.OS === 'web' && response?.type === 'error') {
      showToast('حدث خطأ أثناء الاتصال بجوجل', 'error');
    }
  }, [response]);

  const handleSuccess = async (idToken: string) => {
    setLoading(true);
    try {
      await googleLogin(idToken);
      showToast(
        isRegister ? 'تم إنشاء الحساب عبر Google بنجاح!' : 'تم تسجيل الدخول عبر Google بنجاح!',
        'success'
      );
      onLoginSuccess();
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── إعداد تسجيل الدخول للهواتف (Native Platform Flow) ─────────────────
  const handleGoogleAuthNative = async () => {
    setLoading(true);
    try {
      // التأكد من أن Google Play Services متاحة (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // فتح واجهة Google Sign-In الرسمية (Bottom Sheet / Sign-In Sheet)
      const signInResult = await GoogleSignin.signIn();

      // استخراج الـ idToken — نفس الـ Google ID Token اللي الموقع بيبعته
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        showToast('لم يتم استلام بيانات Google', 'error');
        return;
      }

      // إرسال الـ idToken للـ Backend
      await googleLogin(idToken);
      showToast(
        isRegister ? 'تم إنشاء الحساب عبر Google بنجاح!' : 'تم تسجيل الدخول عبر Google بنجاح!',
        'success'
      );
      onLoginSuccess();
    } catch (error: any) {
      if (isErrorWithCode && isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // المستخدم ألغى العملية — لا نعرض خطأ
            break;
          case statusCodes.IN_PROGRESS:
            showToast('عملية تسجيل الدخول جارية بالفعل', 'info');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showToast('خدمات Google Play غير متاحة أو تحتاج تحديث', 'error');
            break;
          default:
            showToast(error.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google', 'error');
        }
      } else {
        // خطأ من الـ Backend
        showToast(error.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── الدالة الرئيسية للضغط ─────────────────────────────────────────────
  const handleGoogleAuth = () => {
    if (Platform.OS === 'web') {
      promptAsync();
    } else {
      handleGoogleAuthNative();
    }
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
