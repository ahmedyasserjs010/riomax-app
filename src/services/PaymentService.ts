import apiClient from '../api/apiClient';

export const PaymentService = {
  createPaymobIntention: async (payload: any) => {
    const response = await apiClient.post('/payment/create-intention', payload) as any;
    return response.data;
  },

  verifyPaymentStatus: async (orderId: string) => {
    const response = await apiClient.get(`/payment/verify/${orderId}`) as any;
    return response.data;
  }
};
