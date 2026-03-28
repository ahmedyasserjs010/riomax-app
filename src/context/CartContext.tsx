import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useUser } from './UserContext';
import { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get('/cart/getUserCart') as any;
      const items = response.data?.data?.cart?.items || [];
      setCartItems(items);
      setCartCount(items.reduce((acc: number, item: any) => acc + item.quantity, 0));
    } catch (e) {
      console.error('Error fetching cart', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    try {
      await apiClient.post('/cart/addToCart', { productId, quantity });
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
      setCartItems([]);
      setCartCount(0);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoading,
        refreshCart,
        addToCart,
        removeFromCart,
        clearCart,
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
