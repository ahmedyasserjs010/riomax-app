import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export const CartStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'سلة المشتريات' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'إتمام الشراء' }} />
    </Stack.Navigator>
  );
};
