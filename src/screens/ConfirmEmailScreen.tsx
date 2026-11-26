import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { getGuestId, clearGuestId } from '../utils/guest';

export const ConfirmEmailScreen = ({ route, navigation }: any) => {
  const { email } = route.params || {};
  const { colors } = useTheme();
  const { saveAuthData } = useUser();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend OTP cooldown
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend || !email) return;
    setResending(true);
    try {
      await apiClient.post('/auth/resend-confirm-email', { email });
      Alert.alert('تم الإرسال', 'تم إعادة إرسال كود التأكيد إلى بريدك الإلكتروني بنجاح');
      setCountdown(60);
      setCanResend(false);
      setOtp('');
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل إعادة إرسال الرمز');
    } finally {
      setResending(false);
    }
  };

  const handleConfirm = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال رمز التأكيد المكون من 6 أرقام');
      return;
    }
    setLoading(true);
    try {
      const guestId = await getGuestId();
      const res: any = await apiClient.patch('/auth/confirm-email', { email, otp, guestId });

      const creds = res?.data?.data?.newCredentials || res?.data?.newCredentials;
      if (creds?.accessToken && creds?.refreshToken) {
        await saveAuthData(creds.accessToken, creds.refreshToken);
        await clearGuestId();
        Alert.alert('تم بنجاح', 'تم تأكيد حسابك وتسجيل الدخول بنجاح!', [
          {
            text: 'الانتقال للمتجر',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          }
        ]);
      } else {
        Alert.alert('نجاح', 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.', [
          { text: 'تسجيل الدخول', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل تأكيد البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>تأكيد الحساب</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        أدخل الرمز المكون من 6 أرقام المرسل إلى: {'\n'}
        <Text style={{ fontWeight: 'bold', color: colors.text }}>{email}</Text>
      </Text>

      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput 
          style={[styles.input, { color: colors.text, letterSpacing: 10 }]}
          value={otp}
          onChangeText={(val) => setOtp(val.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          autoFocus
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
        />
      </View>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: Colors.primary }]}
        onPress={handleConfirm}
        disabled={loading || otp.length !== 6}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تأكيد الآن</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.resendBtn} 
        onPress={handleResend}
        disabled={!canResend || resending}
      >
        {resending ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : canResend ? (
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>إعادة إرسال الرمز</Text>
        ) : (
          <Text style={{ color: colors.textMuted }}>
            إعادة الإرسال بعد <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{countdown}</Text> ثانية
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  inputWrapper: { 
    borderWidth: 1, 
    borderRadius: 12, 
    height: 65, 
    justifyContent: 'center',
    marginBottom: 30
  },
  input: { fontSize: 28, fontWeight: 'bold' },
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendBtn: { marginTop: 30, alignItems: 'center' },
});
