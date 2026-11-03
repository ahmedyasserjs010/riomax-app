import axios from 'axios';
import { storage } from '../utils/storage';

const API_URLS = {
  production: 'https://api.riomax.com.eg/api/v1',
  preview: 'https://api-staging.riomax.com.eg/api/v1',
  development: 'http://localhost:3000/api/v1',
};

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const env = (process.env.EXPO_PUBLIC_API_ENV as keyof typeof API_URLS) || 'production';
  return API_URLS[env] || API_URLS.production;
};

export const BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];
let isLoggedOut = false;
let sessionExpiredCallback: (() => void) | null = null;

export const setSessionExpiredCallback = (cb: () => void) => {
  sessionExpiredCallback = cb;
};

export const markAsLoggedOut = () => {
  isLoggedOut = true;
  delete apiClient.defaults.headers.common['Authorization'];
  processQueue(new Error('User is logged out'), null);
  failedQueue = [];
};

export const markAsLoggedIn = () => {
  isLoggedOut = false;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach token
apiClient.interceptors.request.use(
  async (config: any) => {
    if (isLoggedOut) {
      if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      return config;
    }
    try {
      const token = await storage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage', e);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isLoggedOut) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (isLoggedOut) {
              return Promise.reject(new Error('User is logged out'));
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (!refreshToken || isLoggedOut) {
          throw new Error(isLoggedOut ? 'Logged out' : 'No refresh token');
        }

        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
            timeout: 15000,
          }
        );

        if (isLoggedOut) {
          throw new Error('Logged out during refresh');
        }

        const { accessToken, refreshToken: newRefresh } = data.data.newCredentials;

        await storage.setItem('accessToken', accessToken);
        await storage.setItem('refreshToken', newRefresh);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        delete apiClient.defaults.headers.common['Authorization'];
        processQueue(refreshError, null);
        isRefreshing = false;
        
        await storage.deleteItem('accessToken');
        await storage.deleteItem('refreshToken');

        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
        
        return Promise.reject(refreshError);
      }
    }

    const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
    const customError = new Error(errorMessage) as any;
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default apiClient;

