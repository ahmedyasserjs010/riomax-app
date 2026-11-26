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

  // Use React Query to fetch and cache wishlist (both user and guest)
  const { data: wishlistData, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/wishlist/getUserWishlist') as any;
        return response.data?.data?.wishlist?.books || [];
      } catch (error) {
        console.warn('Error fetching wishlist:', error);
        return [];
      }
    },
  });

  // Re-fetch wishlist when authentication status changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
  }, [isAuthenticated]);

  const wishlist = wishlistData || [];

  const refreshWishlist = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    await refetch();
  }, [refetch]);

  const toggleWishlist = async (productId: string) => {
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

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((item: IProduct) => (item._id || item.id) === productId);
  }, [wishlist]);

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

