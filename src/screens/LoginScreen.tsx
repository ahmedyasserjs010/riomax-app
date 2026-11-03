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
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useToast } from '../context/ToastContext';

export const LoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { login } = useUser();
  const { showToast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      showToast('يرجى إدخال رقم الهاتف وكلمة المرور', 'info');
      return;
    }
    setLoading(true);
    try {
      await login({ phone: phone.trim(), password });
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
        navigation.navigate('ConfirmPhone', { phone: err.response?.data?.phone || phone.trim() });
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
          {/* ─── الطريقة الأولى: زر Google الموجود أعلى الصفحة ────── */}
          <GoogleAuthButton 
            onLoginSuccess={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }} 
          />

          {/* الرسالة التوضيحية أسفل زر Google */}
          <Text style={[styles.googleHint, { color: colors.textMuted }]}>
            يمكنك تسجيل الدخول من حساب Google الخاص بك من هنا بضغطة واحدة.
          </Text>

          {/* ─── فاصل ─────────────────────────────────────────────── */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>أو برقم الهاتف وكلمة المرور</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* ─── حقل رقم الهاتف ───────────────────────────────────── */}
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
              />
            </View>
          </View>

          {/* ─── حقل كلمة المرور ─────────────────────────────────── */}
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── الطريقة الثانية: زر Google بجوار نسيت كلمة المرور ───── */}
          <View style={styles.optionsRow}>
            {/* زر التسجيل بحساب Google */}
            <View style={{ flex: 1 }}>
              <GoogleAuthButton 
                buttonTitle="التسجيل بحساب Google"
                compact={true}
                onLoginSuccess={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                  });
                }} 
              />
            </View>

            {/* نسيت كلمة المرور */}
            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>
          </View>

          {/* ─── زر تسجيل الدخول ───────────────────────────────────── */}
          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>تسجيل الدخول</Text>}
          </TouchableOpacity>

          {/* ─── الانتقال لإنشاء حساب ──────────────────────────────── */}
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
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
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
