import apiClient from '../api/apiClient';
import { ICategory, IProduct, PaginatedResponse } from '../types';

export const SliderService = {
  getSliders: async () => {
    const response = await apiClient.get('/slider') as any;
    return response.data; // Returns { success: true, data: [...] }
  },
};

export const CategoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get('/category/getAllCategories') as any;
    return response.data; // Returns { success: true, data: [...] }
  },
  
  getCategoriesWithSub: async () => {
    const response = await apiClient.get('/category/getAllCategoriesWithSub') as any;
    return response.data;
  },
};

export const ProductService = {
  getProducts: async (params?: any) => {
    const response = await apiClient.get('/products/getProductsForClient', { params }) as any;
    return response.data; // Returns { success: true, data: { products: [...], pagination: ... } }
  },
  
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/getProductClient/${id}`) as any;
    return response.data; // Returns { success: true, data: IProduct }
  },
};
