import apiClient from '../api/apiClient';
import { User, ApiResponse } from '../types';

export const UserService = {
  getProfile: async () => {
    const response = await apiClient.get('/user/getProfile') as any;
    return response.data?.data?.user;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await apiClient.patch('/user/update-profile', data) as any;
    return response.data?.data?.user;
  },
};

export const OrderService = {
  getUserInvoices: async () => {
    const response = await apiClient.get('/orders/my-orders') as any;
    return response.data?.data?.orders || [];
  },
  
  createOrder: async (payload: any) => {
    const response = await apiClient.post('/orders', payload) as any;
    return response;
  },

  deleteOrder: async (orderId: string) => {
    const response = await apiClient.delete(`/orders/${orderId}`) as any;
    return response.data;
  }
};
