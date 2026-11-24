import React, { useState } from 'react';
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
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني');
      return;
    }
    setLoading(true);
    try {
      await apiClient.patch('/auth/forgot-password', { email });
      Alert.alert('نجاح', 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني');
      setStep(2);
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'حدث خطأ أثناء طلب رمز التأكيد');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('خطأ', 'يرجى إكمال جميع البيانات');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        newConfirmPassword: confirmPassword
      });
      Alert.alert('نجاح', 'تم تغيير كلمة المرور بنجاح', [
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>استعادة كلمة المرور</Text>
      
      {step === 1 ? (
        <View style={styles.form}>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>أدخل بريدك الإلكتروني للحصول على رمز التأكيد</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: Colors.primary }]}
            onPress={handleRequestOTP}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>إرسال الرمز</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>أدخل الرمز المرسل وكلمة المرور الجديدة</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={otp}
              onChangeText={setOtp}
              placeholder="رمز التأكيد (OTP)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 15 }]}>
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="كلمة المرور الجديدة"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 15 }]}>
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="تأكيد كلمة المرور"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: Colors.primary, marginTop: 30 }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تغيير كلمة المرور</Text>}
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: colors.textMuted }}>العودة لتسجيل الدخول</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  form: { width: '100%' },
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
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { marginTop: 40, alignItems: 'center' },
});
