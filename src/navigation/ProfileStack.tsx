import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export const ProfileStack = () => {
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
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'حسابي' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'المفضلة' }} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'طلباتي' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'عن ريوماكس' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'تواصل معنا' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'الشروط والسياسات' }} />
    </Stack.Navigator>
  );
};
