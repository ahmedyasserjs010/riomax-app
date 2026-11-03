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

export const ConfirmPhoneScreen = ({ route, navigation }: any) => {
  const { phone } = route.params || {};
  const { colors } = useTheme();
  const { verifyPhoneOTP } = useUser();
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

  // إرسال تلقائي ذكي عند اكتمال 6 أرقام (سواء تعبئة تلقائية أو إدخال يدوي)
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
      await verifyPhoneOTP(phone, otp.trim());
      showToast('تم التحقق بنجاح! مرحباً بك في ريوماكس 🎉', 'success');
      
      // التوجيه المباشر إلى الشاشة الرئيسية للتطبيق
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
    if (!phone || resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await apiClient.post('/auth/resend-phone-otp', { phone });
      showToast('تم إعادة إرسال رمز التحقق إلى هاتفك 📱', 'success');
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
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="phone-portrait-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>تأكيد رقم الهاتف</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            أدخل رمز التحقق (OTP) المكون من 6 أرقام المرسل إلى:
          </Text>
          <Text style={[styles.phoneText, { color: Colors.primary }]}>{phone || 'رقم هاتفك'}</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={otp}
              onChangeText={(text) => {
                // فلترة الأرقام فقط والحد الأقصى 6 أرقام
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(filtered);
              }}
              placeholder="••••••"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
              // ميزات القراءة التلقائية الذكية للرسائل القصيرة (Smart SMS OTP Autofill)
              textContentType="oneTimeCode" // iOS Autofill
              autoComplete="sms-otp"        // Android Autofill
            />
          </View>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: loading || otp.length !== 6 ? colors.border : Colors.primary }]}
            onPress={handleConfirm}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>تأكيد ودخول الآن</Text>
            )}
          </TouchableOpacity>

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

          <TouchableOpacity 
            style={styles.changePhoneBtn} 
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              تعديل رقم الهاتف أو البيانات
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 35 },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  phoneText: { fontSize: 18, fontWeight: 'bold', marginTop: 6, letterSpacing: 1 },
  form: { width: '100%' },
  inputWrapper: { 
    borderWidth: 1, 
    borderRadius: 14, 
    height: 65, 
    justifyContent: 'center',
    marginBottom: 25,
    paddingHorizontal: 20
  },
  input: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    letterSpacing: 12,
  },
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendContainer: { marginTop: 25, alignItems: 'center' },
  timerText: { fontSize: 14 },
  resendText: { fontSize: 15, fontWeight: 'bold' },
  changePhoneBtn: { marginTop: 25, alignItems: 'center' },
});

