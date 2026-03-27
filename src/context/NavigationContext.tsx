import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  isMenuVisible: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  isLogoutModalVisible: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const openMenu = () => setIsMenuVisible(true);
  const closeMenu = () => setIsMenuVisible(false);
  
  const openLogoutModal = () => {
    setIsMenuVisible(false);
    setIsLogoutModalVisible(true);
  };
  
  const closeLogoutModal = () => setIsLogoutModalVisible(false);

  return (
    <NavigationContext.Provider 
      value={{ 
        isMenuVisible, 
        openMenu, 
        closeMenu, 
        isLogoutModalVisible, 
        openLogoutModal, 
        closeLogoutModal 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useAppNavigation must be used within a NavigationProvider');
  return context;
};
