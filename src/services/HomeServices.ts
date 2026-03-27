import apiClient from '../api/apiClient';
import { ICategory, IProduct, PaginatedResponse } from '../types';

export const SliderService = {
  getSliders: async () => {
    const response = await apiClient.get('/slider') as any;
    return response.data;
  },
};

export const CategoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get('/category') as any;
    return response.data as ICategory[];
  },
  
  getCategoriesWithSub: async () => {
    const response = await apiClient.get('/category/with-sub') as any;
    return response.data as ICategory[];
  },
};

export const ProductService = {
  getProducts: async (params?: any) => {
    const response = await apiClient.get('/product', { params }) as PaginatedResponse<IProduct>;
    return response;
  },
  
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/product/${id}`) as any;
    return response.data as IProduct;
  },
};
