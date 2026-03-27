import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';

export const CartStack = () => {
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
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'سلة المشتريات' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'إتمام الشراء' }} />
    </Stack.Navigator>
  );
};
