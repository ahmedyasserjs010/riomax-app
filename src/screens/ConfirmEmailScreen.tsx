import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ConfirmEmailScreen = ({ route, navigation }: any) => {
  const { email } = route.params || {};
  const { colors } = useTheme();
  const { confirmEmail } = useUser();
  const { showToast } = useToast();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // عداد إعادة الإرسال
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // إرسال تلقائي ذكي فور كتابة 6 أرقام
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleConfirm();
    }
  }, [otp]);

  const handleConfirm = async () => {
    if (otp.length !== 6) {
      showToast('يرجى إدخال رمز التحقق المكون من 6 أرقام', 'info');
      return;
    }

    setLoading(true);
    try {
      await confirmEmail(email, otp.trim());
      showToast('تم تأكيد الحساب بنجاح! مرحباً بك في ريوماكس 🎉', 'success');
      
      // الدخول التلقائي ونقل المستخدم للصفحة الرئيسية
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await apiClient.post('/auth/send-otp', { identifier: email });
      showToast('تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني 📧', 'success');
      setResendTimer(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'فشل إعادة إرسال الرمز';
      showToast(msg, 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* الأيقونة العلوية */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="mail" size={42} color="#3B82F6" />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>تأكيد البريد الإلكتروني</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          أدخل رمز التحقق (OTP) المرسل إلى بريدك:
        </Text>
        {email ? (
          <Text style={[styles.emailBadge, { color: '#3B82F6' }]}>{email}</Text>
        ) : null}

        {/* حقل إدخال الرمز */}
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput 
            style={[styles.input, { color: colors.text }]}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
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

        <Text style={[styles.hint, { color: colors.textMuted }]}>
          سيتم التحقق وتسجيل الدخول تلقائياً فور كتابة الـ 6 أرقام
        </Text>

        {/* زر التأكيد */}
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: loading || otp.length !== 6 ? colors.border : '#3B82F6' }]}
          onPress={handleConfirm}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>تأكيد وتسجيل الدخول</Text>
          )}
        </TouchableOpacity>

        {/* زر إعادة الإرسال */}
        <TouchableOpacity 
          style={styles.resendBtn} 
          onPress={handleResend}
          disabled={resendTimer > 0 || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={[styles.resendText, { color: resendTimer > 0 ? colors.textMuted : '#3B82F6' }]}>
              {resendTimer > 0 ? `إعادة الإرسال بعد ${resendTimer} ثانية` : 'إعادة إرسال الرمز'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 85, height: 85, borderRadius: 42.5, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 4 },
  emailBadge: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  inputWrapper: { 
    borderWidth: 1.5, 
    borderRadius: 16, 
    height: 65, 
    justifyContent: 'center',
    marginBottom: 10
  },
  input: { fontSize: 30, fontWeight: 'bold', letterSpacing: 8 },
  hint: { fontSize: 12, textAlign: 'center', marginBottom: 25 },
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  resendBtn: { marginTop: 25, alignItems: 'center', paddingVertical: 8 },
  resendText: { fontWeight: 'bold', fontSize: 14 },
});
