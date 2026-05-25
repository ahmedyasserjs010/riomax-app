import apiClient from '../api/apiClient';

export interface IPrivacyPolicy {
  id: string;
  policyText: string;
}

export interface IRefundAndCancellation {
  id: string;
  policyText: string;
}

export interface IQuestionAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface IStoreDescription {
  id: string;
  descriptionText: string;
}

export interface ITermsOfUse {
  id: string;
  termsText: string;
}

export interface IFooterLinks {
  id: string;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  email?: string | null;
}

export const PublicService = {
  getPrivacyPolicy: async () => {
    const response = await apiClient.get('/privacy-policy/get') as any;
    return response.data?.data;
  },

  getAllQA: async () => {
    const response = await apiClient.get('/qa/getAllQA') as any;
    return response.data?.data || [];
  },

  getStoreDescription: async () => {
    const response = await apiClient.get('/description/get') as any;
    return response.data?.data;
  },

  getTermsOfUse: async () => {
    const response = await apiClient.get('/terms-of-use/get') as any;
    return response.data?.data;
  },

  getRefundPolicy: async () => {
    const response = await apiClient.get('/refund-cancellation/get') as any;
    return response.data?.data;
  },

  getFooterLinks: async (): Promise<IFooterLinks | null> => {
    const response = await apiClient.get('/footer-links/get') as any;
    return response.data?.data;
  },

  getGeneralSettings: async () => {
    const response = await apiClient.get('/generalSettings/get') as any;
    return response.data?.data;
  },
};
