import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductsListScreen } from '../screens/ProductsListScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';

export const HomeStack = () => {
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
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'ريوماكس' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'تفاصيل المنتج' }} />
      <Stack.Screen name="ProductsList" component={ProductsListScreen} options={{ title: 'البحث والمنتجات' }} />
    </Stack.Navigator>
  );
};
