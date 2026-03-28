import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { TabNavigator } from './TabNavigator';
import { AuthStack } from './AuthStack';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

import { useAppNavigation } from '../context/NavigationContext';
import { BurgerMenu } from '../components/BurgerMenu';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

const RootStack = createNativeStackNavigator();

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
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={TabNavigator} />
        <RootStack.Screen name="Auth" component={AuthStack} />
      </RootStack.Navigator>
      <NavigationConsumer />
    </NavigationContainer>
  );
};

const NavigationConsumer = () => {
  const { 
    isMenuVisible, 
    closeMenu, 
    isLogoutModalVisible, 
    closeLogoutModal, 
    openLogoutModal,
    isProfileSidebarVisible,
    closeProfileSidebar
  } = useAppNavigation();
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
      <ProfileSidebar 
        isVisible={isProfileSidebarVisible}
        onClose={closeProfileSidebar}
        navigation={navigation}
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
