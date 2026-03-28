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
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = formData;
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('خطأ', 'يرجى إكمال جميع البيانات');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', formData);
      Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح. يرجى تأكيد بريدك الإلكتروني من خلال الرمز المرسل إليك.', [{
        text: 'حسناً', onPress: () => navigation.navigate('ConfirmEmail', { email: formData.email })
      }]);
    } catch (err: any) {
      Alert.alert('فشل التسجيل', err.message || 'حدث خطأ أثناء إنشاء الحساب');
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
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>انضم إلى ريوماكس اليوم وتمتع بأفضل العروض</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>الاسم الكامل</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.name}
                onChangeText={(t) => setFormData({...formData, name: t})}
                placeholder="اسمك"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>البريد الإلكتروني</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.email}
                onChangeText={(t) => setFormData({...formData, email: t})}
                placeholder="example@mail.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.phone}
                onChangeText={(t) => setFormData({...formData, phone: t})}
                placeholder="01xxxxxxxxx"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>كلمة المرور</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.password}
                onChangeText={(t) => setFormData({...formData, password: t})}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

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
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.registerBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>إنشاء حساب</Text>}
          </TouchableOpacity>

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
  container: { padding: 24, paddingVertical: 60, justifyContent: 'center' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, textAlign: 'left' },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 12,
    height: 50,
    gap: 10
  },
  input: { flex: 1, height: '100%', fontSize: 15, textAlign: 'left' },
  registerBtn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20
  },
  registerBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  loginLink: { color: Colors.primary, fontWeight: 'bold' },
});
