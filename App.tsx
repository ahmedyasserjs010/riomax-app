import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';
import { UserProvider, useUser } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { NavigationProvider, useAppNavigation } from './src/context/NavigationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

import { ToastProvider } from './src/context/ToastContext';
import { Toast } from './src/components/Toast';

const MainAppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Toast />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <ThemeProvider>
              <ToastProvider>
                <CartProvider>
                  <WishlistProvider>
                    <NavigationProvider>
                      <MainAppContent />
                    </NavigationProvider>
                  </WishlistProvider>
                </CartProvider>
              </ToastProvider>
            </ThemeProvider>
          </UserProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


