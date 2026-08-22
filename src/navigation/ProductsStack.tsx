import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsListScreen } from '../screens/ProductsListScreen';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';
import { ProductsStackParamList } from './navigationTypes';
import { screenTransitions } from './navigationConfig';
import { SharedStackScreens } from './SharedStackScreens';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

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
        ...screenTransitions.push,
      })}
    >
      <Stack.Screen 
        name="ProductsListMain" 
        component={ProductsListScreen} 
        options={{ title: 'كل المنتجات' }} 
      />
      {SharedStackScreens({ Stack })}
    </Stack.Navigator>
  );
};

