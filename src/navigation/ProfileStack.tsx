import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { CartScreen } from '../screens/CartScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { DynamicPageScreen } from '../screens/DynamicPageScreen';
import { QAScreen } from '../screens/QAScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';

export const ProfileStack = () => {
  const { colors } = useTheme();
  const { openMenu } = useAppNavigation();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        header: (props) => (
          <TopNavbar 
            title={props.options.title} 
            onMenuPress={openMenu} 
            navigation={navigation} 
          />
        ),
        contentStyle: { backgroundColor: colors.background },
      })}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'حسابي' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'السلة' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'المفضلة' }} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'طلباتي' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'بيانات المستخدم' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'عن ريوماكس' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'تواصل معنا' }} />
      <Stack.Screen name="Terms" component={DynamicPageScreen} initialParams={{ type: 'terms', title: 'سياسة التوصيل والشحن' }} options={{ title: 'التوصيل والشحن' }} />
      <Stack.Screen name="Privacy" component={DynamicPageScreen} initialParams={{ type: 'privacy', title: 'سياسة الخصوصية' }} options={{ title: 'الخصوصية' }} />
      <Stack.Screen name="Refund" component={DynamicPageScreen} initialParams={{ type: 'refund', title: 'سياسة الاسترداد والإلغاء' }} options={{ title: 'الاسترداد والإلغاء' }} />
      <Stack.Screen name="QA" component={QAScreen} options={{ title: 'الأسئلة الشائعة' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'تغيير كلمة المرور' }} />
    </Stack.Navigator>
  );
};
