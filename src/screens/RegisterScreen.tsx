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

export const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // الحقول المطلوبة فقط: الاسم، رقم الهاتف، كلمة المرور، تأكيد كلمة المرور
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async () => {
    const { name, phone, password, confirmPassword } = formData;
    
    // التحقق من إدخال جميع الحقول
    if (!name.trim() || !phone.trim() || !password || !confirmPassword) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'info');
      return;
    }

    // التحقق من شرط كلمة المرور (6 أحرف أو أرقام على الأقل)
    if (password.length < 6) {
      showToast('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل', 'error');
      return;
    }

    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/register', {
        name: name.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      const phoneParam = response?.data?.data?.phone || phone.trim();
      showToast('تم إرسال رمز التحقق (OTP) إلى هاتفك 📱', 'success');
      
      // الانتقال التلقائي والسلس إلى شاشة إدخال رمز التحقق
      navigation.navigate('ConfirmPhone', { phone: phoneParam });
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
            انضم إلى ريوماكس اليوم وتمتع بأفضل تجربة تسوق
          </Text>
        </View>

        <View style={styles.form}>
          {/* ─── زر Google الموجود أعلى صفحة إنشاء الحساب ─────────── */}
          <GoogleAuthButton 
            isRegister={true}
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
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>أو إنشاء حساب برقم الهاتف</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* 1. حقل الاسم الكامل */}
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
              />
            </View>
          </View>

          {/* 2. حقل رقم الهاتف */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.phone}
                onChangeText={(t) => setFormData({...formData, phone: t})}
                placeholder="01012345678"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                textAlign="left"
              />
            </View>
          </View>

          {/* 3. حقل كلمة المرور */}
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. حقل تأكيد كلمة المرور */}
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
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
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
              <Text style={styles.registerBtnText}>إنشاء حساب جديد</Text>
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
  registerBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginLink: { color: Colors.primary, fontWeight: 'bold' },
});
