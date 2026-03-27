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
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      // Navigation is handled automatically by AppNavigator watching isAuthenticated
    } catch (err: any) {
      Alert.alert('فشل تسجيل الدخول', err.message || 'تأكد من صحة البيانات والمحاولة مرة أخرى');
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
              />
            </View>
          </View>

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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.forgotBtn}
            onPress={() => Alert.alert('قريباً', 'سيتم تفعيل استعادة كلمة المرور قريباً')}
          >
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>تسجيل الدخول</Text>}
          </TouchableOpacity>

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
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'left' },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 15,
    height: 55,
    gap: 12
  },
  input: { flex: 1, height: '100%', fontSize: 16, textAlign: 'left' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: Colors.primary, fontWeight: '600' },
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
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  registerLink: { color: Colors.primary, fontWeight: 'bold' },
});
