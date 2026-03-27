import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsListScreen } from '../screens/ProductsListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';

const Stack = createNativeStackNavigator();

export const ProductsStack = () => {
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
      <Stack.Screen name="ProductsListMain" component={ProductsListScreen} options={{ title: 'كل المنتجات' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'تفاصيل المنتج' }} />
    </Stack.Navigator>
  );
};
