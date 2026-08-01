import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from '../components/TopNavbar';
import { useAppNavigation } from '../context/NavigationContext';
import { ProfileStackParamList } from './navigationTypes';
import { screenTransitions } from './navigationConfig';
import { SharedStackScreens } from './SharedStackScreens';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
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
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'حسابي' }} 
      />
      {SharedStackScreens({ Stack })}
    </Stack.Navigator>
  );
};
