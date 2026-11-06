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
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useToast } from '../context/ToastContext';

/** دالة مساعدة: هل القيمة رقم هاتف؟ */
const isPhoneNumber = (value: string) => /^\+?[0-9]{7,15}$/.test(value.trim());
const isEmailValue = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const LoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { login } = useUser();
  const { showToast } = useToast();
  // حقل موحد يقبل رقم الهاتف أو البريد الإلكتروني
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // نوع الحقل الحالي
  const identifierType = isPhoneNumber(identifier)
    ? 'phone'
    : isEmailValue(identifier)
    ? 'email'
    : 'unknown';

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      showToast('يرجى إدخال رقم الهاتف أو البريد الإلكتروني وكلمة المرور', 'info');
      return;
    }

    const trimmed = identifier.trim();
    const isPhone = isPhoneNumber(trimmed);
    const isEmail = isEmailValue(trimmed);

    if (!isPhone && !isEmail) {
      showToast('يرجى إدخال رقم هاتف صحيح أو بريد إلكتروني صحيح', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = isPhone
        ? { phone: trimmed, password }
        : { email: trimmed.toLowerCase(), password };

      await login(payload);
      showToast('أهلاً بك مجدداً في ريوماكس! 🎉', 'success');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err: any) {
      const isUnverified = err.response?.data?.needsVerification || err.response?.status === 403;
      const msg = err.response?.data?.message || err.message || 'فشل تسجيل الدخول، تأكد من البيانات';
      showToast(msg, 'error');

      if (isUnverified) {
        if (isPhone) {
          navigation.navigate('ConfirmPhone', { phone: err.response?.data?.phone || trimmed });
        } else if (isEmail) {
          navigation.navigate('ConfirmEmail', { email: trimmed.toLowerCase() });
        }
      }
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
          <Text style={[styles.title, { color: colors.text }]}>مرحباً بك مجدداً</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>سجل دخولك للمتابعة في ريوماكس</Text>
        </View>

        <View style={styles.form}>
          {/* ─── زر Google (أعلى الصفحة) ───────────────────────────────── */}
          <GoogleAuthButton 
            onLoginSuccess={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }} 
          />

          <Text style={[styles.googleHint, { color: colors.textMuted }]}>
            يمكنك تسجيل الدخول من حساب Google الخاص بك بضغطة واحدة.
          </Text>

          {/* ─── فاصل ───────────────────────────────────────────────────── */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>أو بكلمة المرور</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* ─── حقل الهاتف أو الإيميل الموحد ─────────────────────────── */}
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
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="01012345678 أو email@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="left"
                autoComplete="tel"
              />
            </View>
            {/* رسالة توضيحية حسب نوع الإدخال */}
            {identifierType === 'phone' && (
              <Text style={[styles.inputHint, { color: Colors.primary }]}>
                📱 سيتم التحقق عبر واتساب
              </Text>
            )}
            {identifierType === 'email' && (
              <Text style={[styles.inputHint, { color: '#3B82F6' }]}>
                📧 سيتم التحقق عبر البريد الإلكتروني
              </Text>
            )}
          </View>

          {/* ─── حقل كلمة المرور ────────────────────────────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>كلمة المرور</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                textAlign="left"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── نسيت كلمة المرور ──────────────────────────────────────── */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>
          </View>

          {/* ─── زر تسجيل الدخول ───────────────────────────────────────── */}
          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>تسجيل الدخول</Text>}
          </TouchableOpacity>

          {/* ─── الانتقال لإنشاء حساب ──────────────────────────────────── */}
          <View style={styles.registerRow}>
            <Text style={{ color: colors.textMuted }}>ليس لديك حساب؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>أنشئ حساباً الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center' },
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
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'left' },
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
  inputHint: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 25,
  },
  forgotBtn: { paddingVertical: 6 },
  forgotText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  loginBtn: { 
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
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  registerLink: { color: Colors.primary, fontWeight: 'bold' },
});
