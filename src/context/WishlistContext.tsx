import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useUser } from './UserContext';
import { IProduct } from '../types';

interface WishlistContextType {
  wishlist: IProduct[];
  wishlistCount: number;
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get('/wishlist') as any;
      setWishlist(response.data || []);
    } catch (e) {
      console.error('Error fetching wishlist', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      // Logic from web app: if exists in list, call DELETE /wishlist/:id, else POST /wishlist
      const exists = wishlist.some(item => (item._id || item.id) === productId);
      if (exists) {
        await apiClient.delete(`/wishlist/${productId}`);
      } else {
        await apiClient.post('/wishlist', { productId });
      }
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isLoading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
