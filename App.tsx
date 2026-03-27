import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider, useUser } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { NavigationProvider, useAppNavigation } from './src/context/NavigationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const MainAppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <NavigationProvider>
                <MainAppContent />
              </NavigationProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
