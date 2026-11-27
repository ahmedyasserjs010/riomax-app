import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
import apiClient from '../api/apiClient';
import { useUser } from './UserContext';
import { CartItem } from '../types';
import { getGuestId, clearGuestId } from '../utils/guest';
import { CartMergeModal } from '../components/CartMergeModal';

interface CartContextType {
  cartItems: CartItem[];
  savedItems: CartItem[];
  cartCount: number;
  savedCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleSaved: (productId: string) => Promise<void>;
  mergeAllSaved: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUser();

  // Use React Query to fetch and cache cart (both user and guest)
  const { data: cartData, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/cart/getUserCart') as any;
        return response.data?.data?.cart || null;
      } catch (error) {
        console.warn('Error fetching cart:', error);
        return null;
      }
    },
  });

  // Re-fetch cart when authentication status changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [isAuthenticated]);

  const [conflictData, setConflictData] = useState<{
    guestCart: any;
    userCart: any;
    guestId: string;
  } | null>(null);

  // Compute saved items and counts
  const savedItems = cartData?.items ? cartData.items.filter((item: any) => item.isSavedForLater) : [];
  const savedCount = savedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  useEffect(() => {
    const checkConflict = async () => {
      if (isAuthenticated) {
        const guestId = await getGuestId();
        if (guestId) {
          try {
            const preview: any = await apiClient.get('/cart/merge-preview', { params: { guestId } });
            const data = preview?.data?.data;
            if (data?.hasConflict && data.guestCart && data.userCart) {
              setConflictData({
                guestCart: data.guestCart,
                userCart: data.userCart,
                guestId
              });
            }
          } catch (e) {
            console.warn('Check cart conflict error:', e);
          }
        }
      }
    };
    checkConflict();
  }, [isAuthenticated]);

  const resolveConflict = async (action: 'merge' | 'keep_guest' | 'keep_user') => {
    if (!conflictData?.guestId) return;
    try {
      await apiClient.post('/cart/resolve-merge', {
        guestId: conflictData.guestId,
        action
      });
      setConflictData(null);
      await clearGuestId();
      await refreshCart();
    } catch (e) {
      console.error('Resolve cart conflict error:', e);
    }
  };

  const cartItems = cartData?.items ? cartData.items : [];
  const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const refreshCart = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['cart'] });
    await refetch();
  }, [refetch]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await apiClient.post('/cart/addToCart', { productId, quantity });
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      await apiClient.put('/cart/updateCart', { productId, quantity });
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await apiClient.delete(`/cart/removeFromCart/${productId}`);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await apiClient.delete('/cart/clearCart');
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const toggleSaved = async (productId: string) => {
    try {
      await apiClient.patch(`/cart/toggle-saved/${productId}`);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const mergeAllSaved = async () => {
    try {
      await apiClient.post('/cart/merge-all-saved');
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const isInCart = useCallback((productId: string) => {
    return cartItems.some((item: CartItem) => {
      const prod = item.Products;
      if (typeof prod === 'string') return prod === productId;
      return (prod?._id || prod?.id) === productId;
    });
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoading,
        refreshCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
      {conflictData && (
        <CartMergeModal
          visible={Boolean(conflictData)}
          guestCart={conflictData.guestCart}
          userCart={conflictData.userCart}
          onResolve={resolveConflict}
        />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

