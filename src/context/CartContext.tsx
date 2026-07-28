import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
import apiClient from '../api/apiClient';
import { useUser } from './UserContext';
import { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUser();

  // Use React Query to fetch and cache user cart
  const { data: cartData, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get('/cart/getUserCart') as any;
      return response.data?.data?.cart || null;
    },
    enabled: isAuthenticated,
  });

  const cartItems = isAuthenticated && cartData?.items ? cartData.items : [];
  const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const refreshCart = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['cart'] });
    await refetch();
  }, [refetch]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      await apiClient.post('/cart/addToCart', { productId, quantity });
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      await apiClient.put('/cart/updateCart', { productId, quantity });
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      await apiClient.delete(`/cart/removeFromCart/${productId}`);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      await apiClient.delete('/cart/clearCart');
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
        isLoading: isAuthenticated ? isLoading : false,
        refreshCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

