import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
import apiClient, { setSessionExpiredCallback, markAsLoggedOut, markAsLoggedIn } from '../api/apiClient';
import { LoginPayload, User } from '../types';
import { storage } from '../utils/storage';

interface UserContextType {
  userToken: string | null;
  userData: User | null;
  fullProfile: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  saveAuthData: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Force logout handler — called by apiClient when refresh fails
  const forceLogout = useCallback(async () => {
    markAsLoggedOut();
    await storage.deleteItem('accessToken');
    await storage.deleteItem('refreshToken');
    setUserToken(null);
    setUserData(null);
    queryClient.clear();
  }, []);

  // Register session expired callback with apiClient
  useEffect(() => {
    setSessionExpiredCallback(forceLogout);
    return () => {
      setSessionExpiredCallback(() => {});
    };
  }, [forceLogout]);

  // Use React Query for profile fetching and caching
  const { data: fullProfile, refetch } = useQuery<User | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/user/getProfile') as any;
        return response.data?.data?.user || null;
      } catch (error) {
        console.error('Error fetching profile in useQuery', error);
        return null;
      }
    },
    enabled: !!userToken,
  });

  const saveAuthData = async (accessToken: string, refreshToken: string) => {
    markAsLoggedIn();
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    setUserToken(accessToken);
    try {
      const decoded = jwtDecode<any>(accessToken);
      setUserData({
        id: decoded.id || decoded.sub,
        _id: decoded._id || decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role?.toLowerCase(),
      } as User);
      
      // Invalidate and trigger refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }, 50);
    } catch (e) {
      console.error('Token decoding error', e);
    }
  };

  const refreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
    await refetch();
  };

  const login = async (payload: LoginPayload) => {
    try {
      const response = await apiClient.post('/auth/login', payload) as any;
      const { accessToken, refreshToken } = response.data.data.newCredentials;
      await saveAuthData(accessToken, refreshToken);
    } catch (error) {
      throw error;
    }
  };

  const verifyPhoneOTP = async (phone: string, otp: string) => {
    try {
      const response = await apiClient.post('/auth/verify-phone-otp', { phone, otp }) as any;
      const { accessToken, refreshToken } = response.data.data.newCredentials;
      await saveAuthData(accessToken, refreshToken);
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const response = await apiClient.post('/auth/social-login-google', { token: credential }) as any;
      const { accessToken, refreshToken } = response.data.data.newCredentials;
      await saveAuthData(accessToken, refreshToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    markAsLoggedOut();
    try {
      await apiClient.post('/auth/logout', { flag: 'logout' });
    } catch (e) {
      console.error('Logout API error', e);
    } finally {
      await storage.deleteItem('accessToken');
      await storage.deleteItem('refreshToken');
      setUserToken(null);
      setUserData(null);
      // Clear React Query cache on logout to prevent data leak
      queryClient.clear();
    }
  };

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const token = await storage.getItem('accessToken');
        if (token) {
          markAsLoggedIn();
          setUserToken(token);
          const decoded = jwtDecode<any>(token);
          setUserData({
            id: decoded.id || decoded.sub,
            _id: decoded._id || decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role?.toLowerCase(),
          } as User);
        } else {
          markAsLoggedOut();
        }
      } catch (e) {
        console.error('Error loading stored auth', e);
        markAsLoggedOut();
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userToken,
        userData,
        fullProfile: fullProfile || null,
        isAuthenticated: !!userToken,
        isLoading,
        login,
        verifyPhoneOTP,
        googleLogin,
        saveAuthData,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

