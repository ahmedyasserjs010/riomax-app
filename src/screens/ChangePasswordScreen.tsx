import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = formData;
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('خطأ', 'يرجى إكمال جميع الحقول');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch('/auth/change-password', {
        oldPassword,
        newPassword,
        newConfirmPassword: confirmPassword
      });
      Alert.alert('نجاح', 'تم تغيير كلمة المرور بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('فشل', err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
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
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="lock-closed" size={40} color={Colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>تغيير كلمة المرور</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة لضمان أمان حسابك.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>كلمة المرور الحالية</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.oldPassword}
                onChangeText={(t) => setFormData({...formData, oldPassword: t})}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>كلمة المرور الجديدة</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={formData.newPassword}
                onChangeText={(t) => setFormData({...formData, newPassword: t})}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>تأكيد كلمة المرور الجديدة</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
            style={[styles.btn, { backgroundColor: Colors.primary }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تحديث كلمة المرور</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'right' },
  inputWrapper: { 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 15,
    height: 55,
  },
  input: { flex: 1, height: '100%', fontSize: 16, textAlign: 'right' },
  btn: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
