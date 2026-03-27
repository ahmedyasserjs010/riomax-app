import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { HomeStack } from './HomeStack';
import { CategoryStack } from './CategoryStack';
import { CartStack } from './CartStack';
import { ProfileStack } from './ProfileStack';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { colors, isDark } = useTheme();
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Categories') iconName = 'grid';
          else if (route.name === 'Cart') iconName = 'cart';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'الرئيسية', headerShown: false }} />
      <Tab.Screen name="Categories" component={CategoryStack} options={{ title: 'الأقسام', headerShown: false }} />
      <Tab.Screen 
        name="Cart" 
        component={CartStack} 
        options={{ 
          title: 'السلة',
          headerShown: false,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.primary }
        }} 
      />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'حسابي', headerShown: false }} />
    </Tab.Navigator>
  );
};
