import apiClient from '../api/apiClient';
import { User, ApiResponse } from '../types';

export const UserService = {
  getProfile: async () => {
    const response = await apiClient.get('/auth/get-user') as ApiResponse<{ user: User }>;
    return response.data.user;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await apiClient.patch('/profiles/update', data) as ApiResponse<User>;
    return response.data;
  },
};

export const OrderService = {
  getUserInvoices: async () => {
    const response = await apiClient.get('/order/userInvoices') as any;
    return response.data || [];
  },
  
  createOrder: async (payload: any) => {
    const response = await apiClient.post('/order', payload) as any;
    return response;
  }
};
