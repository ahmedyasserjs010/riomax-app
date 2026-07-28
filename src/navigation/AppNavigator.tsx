import React from 'react';
import { enableScreens, enableFreeze } from 'react-native-screens';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { TabNavigator } from './TabNavigator';
import { AuthStack } from './AuthStack';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useAppNavigation } from '../context/NavigationContext';

// Components
import { BurgerMenu } from '../components/BurgerMenu';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

// Screens to be shared at Root level
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { DynamicPageScreen } from '../screens/DynamicPageScreen';

// Types & Config
import { RootStackParamList } from './navigationTypes';
import { linkingConfig, screenTransitions } from './navigationConfig';

// Initialize react-native-screens optimizations
enableScreens(true);
enableFreeze(true);

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isLoading } = useUser();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linkingConfig}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={TabNavigator} />
        <RootStack.Screen 
          name="Auth" 
          component={AuthStack} 
          options={screenTransitions.modal} 
        />
        {/* Shared Root Screens */}
        <RootStack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          options={screenTransitions.push} 
        />
        <RootStack.Screen 
          name="Checkout" 
          component={CheckoutScreen} 
          options={screenTransitions.push} 
        />
        <RootStack.Screen 
          name="DynamicPage" 
          component={DynamicPageScreen} 
          options={screenTransitions.push} 
        />
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
  const navigation = useNavigation<any>();

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
