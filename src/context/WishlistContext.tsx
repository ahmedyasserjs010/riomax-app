import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
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

  // Use React Query to fetch and cache user wishlist
  const { data: wishlistData, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiClient.get('/wishlist/getUserWishlist') as any;
      return response.data?.data?.wishlist?.books || [];
    },
    enabled: isAuthenticated,
  });

  const wishlist = isAuthenticated && wishlistData ? wishlistData : [];

  const refreshWishlist = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    await refetch();
  }, [refetch]);

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      const exists = wishlist.some((item: IProduct) => (item._id || item.id) === productId);
      if (exists) {
        await apiClient.delete(`/wishlist/removeFromWishlist/${productId}`);
      } else {
        await apiClient.post('/wishlist/addToWishlist', { productId });
      }
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item: IProduct) => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isLoading: isAuthenticated ? isLoading : false,
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

