import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductsListScreen } from '../screens/ProductsListScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
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
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'ريوماكس' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'تفاصيل المنتج' }} />
      <Stack.Screen name="ProductsList" component={ProductsListScreen} options={{ title: 'البحث والمنتجات' }} />
    </Stack.Navigator>
  );
};
