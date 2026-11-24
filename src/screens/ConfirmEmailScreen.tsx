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

export const ConfirmEmailScreen = ({ route, navigation }: any) => {
  const { email } = route.params || {};
  const { colors } = useTheme();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!otp) {
      Alert.alert('خطأ', 'يرجى إدخال رمز التأكيد');
      return;
    }
    setLoading(true);
    try {
      await apiClient.patch('/auth/confirm-email', { email, otp });
      Alert.alert('نجاح', 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.', [
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل تأكيد البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>تأكيد الحساب</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        أدخل الرمز المكون من 6 أرقام المرسل إلى: {'\n'}
        <Text style={{ fontWeight: 'bold', color: colors.text }}>{email}</Text>
      </Text>

      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput 
          style={[styles.input, { color: colors.text, letterSpacing: 10 }]}
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: Colors.primary }]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تأكيد الآن</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendBtn} onPress={() => Alert.alert('قريباً', 'سيتم تفعيل إعادة إرسال الرمز قريباً')}>
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>إعادة إرسال الرمز</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  inputWrapper: { 
    borderWidth: 1, 
    borderRadius: 12, 
    height: 65, 
    justifyContent: 'center',
    marginBottom: 30
  },
  input: { fontSize: 28, fontWeight: 'bold' },
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendBtn: { marginTop: 30, alignItems: 'center' },
});
