import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { HomeStack } from './HomeStack';
import { ProductsStack } from './ProductsStack';
import { ProfileStack } from './ProfileStack';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Products') iconName = 'grid';
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
      <Tab.Screen name="Products" component={ProductsStack} options={{ title: 'كل المنتجات', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'حسابي', headerShown: false }} />
    </Tab.Navigator>
  );
};
