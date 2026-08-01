import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';
import { HomeStackParamList } from './navigationTypes';
import { screenTransitions } from './navigationConfig';
import { SharedStackScreens } from './SharedStackScreens';

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
      {SharedStackScreens({ Stack })}
    </Stack.Navigator>
  );
};

