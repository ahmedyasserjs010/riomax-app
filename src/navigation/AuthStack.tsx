import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ConfirmEmailScreen } from '../screens/ConfirmEmailScreen';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'تسجيل الدخول' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'إنشاء حساب' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'استعادة كلمة المرور' }} />
      <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} options={{ title: 'تأكيد الحساب' }} />
    </Stack.Navigator>
  );
};
