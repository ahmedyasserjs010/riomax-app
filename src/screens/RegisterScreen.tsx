import React, { useState } from 'react';
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
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useToast } from '../context/ToastContext';

/** دالة مساعدة: هل القيمة رقم هاتف؟ */
const isPhoneNumber = (value: string) => /^\+?[0-9]{7,15}$/.test(value.trim());
const isEmailValue = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // حقل موحد يقبل رقم الهاتف أو البريد الإلكتروني
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',  // رقم الهاتف أو البريد الإلكتروني
    password: '',
    confirmPassword: ''
  });

  // نوع الحقل الحالي
  const identifierType = isPhoneNumber(formData.identifier)
    ? 'phone'
    : isEmailValue(formData.identifier)
    ? 'email'
    : 'unknown';

  const handleRegister = async () => {
    const { name, identifier, password, confirmPassword } = formData;
    
    if (!name.trim() || !identifier.trim() || !password || !confirmPassword) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'info');
      return;
    }

    const isPhone = isPhoneNumber(identifier.trim());
    const isEmail = isEmailValue(identifier.trim());

    if (!isPhone && !isEmail) {
      showToast('يرجى إدخال رقم هاتف صحيح أو بريد إلكتروني صحيح', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = isPhone
        ? {
            name: name.trim(),
            phone: identifier.trim(),
            password,
            confirmPassword,
          }
        : {
            name: name.trim(),
            email: identifier.trim().toLowerCase(),
            password,
            confirmPassword,
          };

      const response: any = await apiClient.post('/auth/register', payload);

      if (isPhone) {
        const phoneParam = response?.data?.data?.phone || identifier.trim();
        showToast('تم إرسال رمز التحقق (OTP) إلى واتساب 📱', 'success');
        navigation.navigate('ConfirmPhone', { phone: phoneParam });
      } else {
        showToast('تم إرسال رمز التحقق إلى بريدك الإلكتروني 📧', 'success');
        navigation.navigate('ConfirmEmail', { email: identifier.trim().toLowerCase() });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً';
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
          <Text style={[styles.title, { color: colors.text }]}>إنشاء حساب جديد</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            انضم إلى ريوماكس وتمتع بأفضل تجربة تسوق
          </Text>
        </View>

        <View style={styles.form}>
          {/* ─── زر Google ──────────────────────────────────────────────── */}
          <GoogleAuthButton 
            isRegister={true}
            onLoginSuccess={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }} 
          />

          <Text style={[styles.googleHint, { color: colors.textMuted }]}>
            يمكنك التسجيل من حساب Google الخاص بك بضغطة واحدة.
          </Text>

          {/* ─── فاصل ────────────────────────────────────────────────────── */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>أو إنشاء حساب</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* 1. الاسم الكامل */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>الاسم الكامل</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.name}
                onChangeText={(t) => setFormData({...formData, name: t})}
                placeholder="أحمد محمد"
                placeholderTextColor={colors.textMuted}
                textAlign="right"
                autoComplete="name"
              />
            </View>
          </View>

          {/* 2. حقل موحد: رقم الهاتف أو البريد الإلكتروني */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف أو البريد الإلكتروني</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons 
                name={identifierType === 'email' ? 'mail-outline' : 'call-outline'} 
                size={20} 
                color={identifierType === 'phone' ? Colors.primary : identifierType === 'email' ? '#3B82F6' : colors.textMuted} 
              />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.identifier}
                onChangeText={(t) => setFormData({...formData, identifier: t})}
                placeholder="01012345678 أو email@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="left"
                autoComplete="tel"
              />
            </View>
            {identifierType === 'phone' && (
              <Text style={[styles.inputHint, { color: Colors.primary }]}>
                📱 سيُرسَل رمز التحقق على واتساب
              </Text>
            )}
            {identifierType === 'email' && (
              <Text style={[styles.inputHint, { color: '#3B82F6' }]}>
                📧 سيُرسَل رمز التحقق إلى بريدك الإلكتروني
              </Text>
            )}
          </View>

          {/* 3. كلمة المرور */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              كلمة المرور (6 أحرف أو أرقام على الأقل)
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.password}
                onChangeText={(t) => setFormData({...formData, password: t})}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                textAlign="left"
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. تأكيد كلمة المرور */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>تأكيد كلمة المرور</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.confirmPassword}
                onChangeText={(t) => setFormData({...formData, confirmPassword: t})}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                textAlign="left"
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* زر إنشاء الحساب */}
          <TouchableOpacity 
            style={[styles.registerBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>
                {identifierType === 'phone'
                  ? '📱 إنشاء الحساب والتحقق عبر واتساب'
                  : identifierType === 'email'
                  ? '📧 إنشاء الحساب والتحقق عبر الإيميل'
                  : 'إنشاء حساب جديد'}
              </Text>
            )}
          </TouchableOpacity>

          {/* الانتقال لتسجيل الدخول */}
          <View style={styles.loginRow}>
            <Text style={{ color: colors.textMuted }}>لديك حساب بالفعل؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>سجل دخولك</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingVertical: 40, justifyContent: 'center' },
  header: { marginBottom: 25, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  form: { width: '100%' },
  googleHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 18,
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 15 },
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
  input: { flex: 1, height: '100%', fontSize: 15 },
  inputHint: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  registerBtn: { 
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
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginLink: { color: Colors.primary, fontWeight: 'bold' },
});
