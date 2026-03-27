import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { TabNavigator } from './TabNavigator';
import { AuthStack } from './AuthStack';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

import { useAppNavigation } from '../context/NavigationContext';
import { BurgerMenu } from '../components/BurgerMenu';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, logout } = useUser();
  const { colors } = useTheme();
  const { isMenuVisible, closeMenu, isLogoutModalVisible, closeLogoutModal, openLogoutModal } = useAppNavigation();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
      <NavigationConsumer />
    </NavigationContainer>
  );
};

const NavigationConsumer = () => {
  const { isMenuVisible, closeMenu, isLogoutModalVisible, closeLogoutModal, openLogoutModal } = useAppNavigation();
  const { logout } = useUser();
  const navigation = require('@react-navigation/native').useNavigation();

  return (
    <>
      <BurgerMenu 
        isVisible={isMenuVisible} 
        onClose={closeMenu} 
        navigation={navigation}
        onLogout={openLogoutModal}
      />
      <LogoutConfirmModal 
        isVisible={isLogoutModalVisible} 
        onClose={closeLogoutModal} 
        onConfirm={async () => {
          await logout();
          closeLogoutModal();
        }}
      />
    </>
  );
};
