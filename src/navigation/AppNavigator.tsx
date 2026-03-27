import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { TabNavigator } from './TabNavigator';
import { AuthStack } from './AuthStack';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useUser();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};
