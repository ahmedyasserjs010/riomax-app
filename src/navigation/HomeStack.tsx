import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsListScreen } from '../screens/ProductsListScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryProductsScreen } from '../screens/CategoryProductsScreen';
import { CartScreen } from '../screens/CartScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';
import { HomeStackParamList } from './navigationTypes';
import { screenTransitions } from './navigationConfig';

const Stack = createNativeStackNavigator<HomeStackParamList>();

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
        ...screenTransitions.push,
      })}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'ريوماكس' }} 
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ title: 'الأقسام' }} 
      />
      <Stack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen} 
        options={({ route }) => ({ title: route.params?.name || 'المنتجات' })} 
      />
      <Stack.Screen 
        name="ProductsList" 
        component={ProductsListScreen} 
        options={{ title: 'البحث والمنتجات' }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'سلة المشتريات' }} 
      />
      <Stack.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ title: 'المفضلة' }} 
      />
    </Stack.Navigator>
  );
};
