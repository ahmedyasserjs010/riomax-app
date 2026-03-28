import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, title, subtitle }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed-outline" size={80} color={colors.textMuted} />
        <Text style={[styles.title, { color: colors.text }]}>
          {title || 'لم تقم بعد بتسجيل الدخول'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {subtitle || 'قم بتسجيل الدخول لكي يتم عرض البيانات الخاصة بك.'}
        </Text>
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
