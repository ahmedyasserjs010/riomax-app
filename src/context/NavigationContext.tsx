import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  isMenuVisible: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  isLogoutModalVisible: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  isProfileSidebarVisible: boolean;
  openProfileSidebar: () => void;
  closeProfileSidebar: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);

  const openMenu = () => setIsMenuVisible(true);
  const closeMenu = () => setIsMenuVisible(false);
  
  const openLogoutModal = () => {
    setIsMenuVisible(false);
    setIsLogoutModalVisible(true);
  };
  
  const closeLogoutModal = () => setIsLogoutModalVisible(false);

  const openProfileSidebar = () => setIsProfileSidebarVisible(true);
  const closeProfileSidebar = () => setIsProfileSidebarVisible(false);

  return (
    <NavigationContext.Provider 
      value={{ 
        isMenuVisible, 
        openMenu, 
        closeMenu, 
        isLogoutModalVisible, 
        openLogoutModal, 
        closeLogoutModal,
        isProfileSidebarVisible,
        openProfileSidebar,
        closeProfileSidebar
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
