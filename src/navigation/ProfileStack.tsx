import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { QAScreen } from '../screens/QAScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';
import { ProfileStackParamList } from './navigationTypes';
import { screenTransitions } from './navigationConfig';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

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
        ...screenTransitions.push,
      })}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'حسابي' }} 
      />
      <Stack.Screen 
        name="Invoices" 
        component={InvoicesScreen} 
        options={{ title: 'طلباتي' }} 
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen} 
        options={{ title: 'بيانات المستخدم' }} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'عن ريوماكس' }} 
      />
      <Stack.Screen 
        name="Contact" 
        component={ContactScreen} 
        options={{ title: 'تواصل معنا' }} 
      />
      <Stack.Screen 
        name="QA" 
        component={QAScreen} 
        options={{ title: 'الأسئلة الشائعة' }} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'تغيير كلمة المرور' }} 
      />
    </Stack.Navigator>
  );
};
