import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryProductsScreen } from '../screens/CategoryProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export const CategoryStack = () => {
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
      <Stack.Screen name="CategoriesMain" component={CategoriesScreen} options={{ title: 'الأقسام' }} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} options={({ route }: any) => ({ title: route.params?.name || 'المنتجات' })} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'تفاصيل المنتج' }} />
    </Stack.Navigator>
  );
};
