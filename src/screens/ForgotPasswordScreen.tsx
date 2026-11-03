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
import { useToast } from '../context/ToastContext';
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // عداد إعادة الإرسال
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  const handleRequestOTP = async () => {
    if (method === 'phone' && !phone.trim()) {
      showToast('يرجى إدخال رقم الهاتف', 'info');
      return;
    }
    if (method === 'email' && !email.trim()) {
      showToast('يرجى إدخال البريد الإلكتروني', 'info');
      return;
    }

    setLoading(true);
    try {
      const payload = method === 'phone' ? { phone: phone.trim() } : { email: email.trim().toLowerCase() };
      const response: any = await apiClient.patch('/auth/forgot-password', payload);
      
      if (response?.data?.data?.debugOtp) {
        setDebugOtp(response.data.data.debugOtp);
      }

      showToast(
        method === 'phone' ? 'تم إرسال رمز التحقق إلى هاتفك 📱' : 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
        'success'
      );
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'حدث خطأ أثناء طلب رمز التأكيد';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const payload = method === 'phone' ? { phone: phone.trim() } : { email: email.trim().toLowerCase() };
      const response: any = await apiClient.patch('/auth/forgot-password', payload);
      
      if (response?.data?.data?.debugOtp) {
        setDebugOtp(response.data.data.debugOtp);
      }
      
      showToast('تم إعادة إرسال رمز التحقق بنجاح 📱', 'success');
      setResendTimer(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'فشل إعادة إرسال الرمز';
      showToast(msg, 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword || !confirmPassword) {
      showToast('يرجى إكمال جميع الحقول', 'info');
      return;
    }
    if (newPassword.length < 6) {
      showToast('يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        otp: otp.trim(),
        newPassword,
        newConfirmPassword: confirmPassword
      };

      if (method === 'phone') {
        payload.phone = phone.trim();
      } else {
        payload.email = email.trim().toLowerCase();
      }

      await apiClient.post('/auth/reset-password', payload);
      showToast('تم تغيير كلمة المرور بنجاح! 🎉', 'success');
      navigation.navigate('Login');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'فشل في تغيير كلمة المرور';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="key-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 1 ? 'استعادة كلمة المرور' : 'إعادة تعيين كلمة المرور'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {step === 1 
              ? (method === 'phone' ? 'أدخل رقم هاتفك المسجل لاستلام رمز التحقق' : 'أدخل بريدك الإلكتروني لاستلام رمز التحقق')
              : `أدخل الرمز المرسل إلى: ${method === 'phone' ? phone : email}`}
          </Text>

          {debugOtp && (
            <View style={styles.debugBanner}>
              <Text style={styles.debugText}>رمز التحقق للمعاينة: {debugOtp}</Text>
            </View>
          )}
        </View>

        {step === 1 ? (
          /* ─── الخطوة 1: إدخال رقم الهاتف ─── */
          <View style={styles.form}>
            {method === 'phone' ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="call-outline" size={20} color={colors.textMuted} />
                  <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="01012345678"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    textAlign="left"
                    autoFocus
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>البريد الإلكتروني</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                  <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@mail.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign="left"
                    autoFocus
                  />
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: loading ? colors.border : Colors.primary }]}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>إرسال رمز التحقق</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchMethodBtn}
              onPress={() => setMethod(method === 'phone' ? 'email' : 'phone')}
            >
              <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>
                {method === 'phone' ? 'الاستعادة عبر البريد الإلكتروني القديم' : 'الاستعادة عبر رقم الهاتف (الأساسي)'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ─── الخطوة 2: إدخال OTP وكلمة المرور الجديدة ─── */
          <View style={styles.form}>
            {/* كود OTP مع ميزة القراءة التلقائية الذكية للرسائل */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>رمز التحقق (OTP)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} />
                <TextInput 
                  style={[styles.input, { color: colors.text, letterSpacing: 6, fontSize: 20, fontWeight: 'bold' }]}
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  autoFocus
                />
              </View>
            </View>

            {/* كلمة المرور الجديدة */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>كلمة المرور الجديدة</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  textAlign="left"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* تأكيد كلمة المرور الجديدة */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>تأكيد كلمة المرور</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  textAlign="left"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: loading ? colors.border : Colors.primary }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تغيير كلمة المرور</Text>}
            </TouchableOpacity>

            {/* إعادة إرسال الكود */}
            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Text style={[styles.timerText, { color: colors.textMuted }]}>
                  إعادة إرسال الرمز خلال{' '}
                  <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{resendTimer} ثانية</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                  <Text style={[styles.resendText, { color: Colors.primary }]}>
                    {resendLoading ? 'جاري الإرسال...' : 'إعادة إرسال رمز التحقق'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: colors.textMuted }}>العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 25 },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  debugBanner: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  debugText: { color: '#92400e', fontSize: 12, fontWeight: 'bold' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, textAlign: 'left' },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 15,
    height: 52,
    gap: 12
  },
  input: { flex: 1, height: '100%', fontSize: 15, textAlign: 'left' },
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  switchMethodBtn: { marginTop: 20, alignItems: 'center' },
  resendContainer: { marginTop: 20, alignItems: 'center' },
  timerText: { fontSize: 13 },
  resendText: { fontSize: 14, fontWeight: 'bold' },
  backBtn: { marginTop: 30, alignItems: 'center' },
});
