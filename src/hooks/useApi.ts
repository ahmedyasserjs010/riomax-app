import { useQuery } from '@tanstack/react-query';
import { SliderService, CategoryService, ProductService } from '../services/HomeServices';
import { OrderService } from '../services/ProfileServices';
import { PublicService, IQuestionAnswer } from '../services/PublicService';
import { IProduct, ICategory, ISlider } from '../types';

// Sliders Query
export const useSliders = () => {
  return useQuery<ISlider[]>({
    queryKey: ['sliders'],
    queryFn: async () => {
      const res = await SliderService.getSliders();
      console.log('[useSliders] raw res:', JSON.stringify(res).substring(0, 300));
      console.log('[useSliders] res.data:', JSON.stringify(res.data).substring(0, 300));
      console.log('[useSliders] res.data?.slides:', JSON.stringify(res.data?.slides).substring(0, 300));
      const result = res.data?.slides || res.data || [];
      console.log('[useSliders] final result length:', Array.isArray(result) ? result.length : 'NOT_ARRAY');
      return result;
    },
  });
};

// Categories Tree Query (Categories with sub-categories)
export const useCategoriesTree = () => {
  return useQuery<ICategory[]>({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const res = await CategoryService.getCategoriesWithSub();
      console.log('[useCategoriesTree] raw res:', JSON.stringify(res).substring(0, 300));
      console.log('[useCategoriesTree] res.data:', JSON.stringify(res.data).substring(0, 300));
      const result = res.data || [];
      console.log('[useCategoriesTree] final result length:', Array.isArray(result) ? result.length : 'NOT_ARRAY');
      return result;
    },
  });
};

// All Categories Query (flat list)
export const useAllCategories = () => {
  return useQuery<ICategory[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await CategoryService.getAllCategories();
      console.log('[useAllCategories] raw res:', JSON.stringify(res).substring(0, 300));
      // Fix: unwrap nested data array (API returns { message, data: [...] })
      const result = res.data || [];
      console.log('[useAllCategories] final result length:', Array.isArray(result) ? result.length : 'NOT_ARRAY');
      return result;
    },
  });
};

// Products Query
export interface UseProductsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryId?: string;
  subCategoryId?: string;
  category?: string; // used in CategoryProductsScreen
}

export const useProducts = (params: UseProductsParams = {}) => {
  return useQuery<{ products: IProduct[]; pagination: any }>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await ProductService.getProducts(params);
      return {
        products: res.data?.products || [],
        pagination: res.data?.pagination || { totalCount: 0, totalPages: 1, currentPage: 1 },
      };
    },
  });
};

// Product Detail Query
export const useProductDetail = (productId: string) => {
  return useQuery<IProduct>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await ProductService.getProductById(productId);
      return res.data || res;
    },
    enabled: !!productId,
  });
};

// Invoices / User Orders Query
export const useInvoices = (enabled: boolean = true) => {
  return useQuery<any[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      return await OrderService.getUserInvoices();
    },
    enabled,
  });
};

// Static Policy Query (privacy, refund, terms)
export const usePolicy = (type: 'privacy' | 'refund' | 'terms') => {
  return useQuery<string>({
    queryKey: ['policy', type],
    queryFn: async () => {
      let data;
      if (type === 'privacy') {
        data = await PublicService.getPrivacyPolicy();
        return data?.policyText || '';
      } else if (type === 'refund') {
        data = await PublicService.getRefundPolicy();
        return data?.policyText || '';
      } else {
        data = await PublicService.getTermsOfUse();
        return data?.termsText || '';
      }
    },
  });
};

// QA / FAQ Query
export const useQA = () => {
  return useQuery<IQuestionAnswer[]>({
    queryKey: ['qa'],
    queryFn: async () => {
      return await PublicService.getAllQA();
    },
  });
};

// General Settings Query
export const useGeneralSettings = () => {
  return useQuery<any>({
    queryKey: ['settings'],
    queryFn: async () => {
      return await PublicService.getGeneralSettings();
    },
  });
};
