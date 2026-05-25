import apiClient from '../api/apiClient';

export interface ValidateCouponResponse {
  code: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
}

export interface ApplyCouponResponse {
  code: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  discountAmount: string;
  cartTotal: string;
  totalAfterDiscount: string;
}

export const CouponService = {
  validateCoupon: async (code: string) => {
    const response = await apiClient.post('/coupons/validate', { code }) as any;
    return response.data?.data;
  },

  applyCoupon: async (code: string, cartTotal: number) => {
    const response = await apiClient.post('/coupons/apply', { code, cartTotal }) as any;
    return response.data?.data;
  }
};
