import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://api.riomax.com.eg/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

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
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from SecureStore', e);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response: any) => response.data,
  async (error: any) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { accessToken, refreshToken: newRefresh } = data.data.newCredentials;

        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefresh);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        
        // Note: Global navigation redirect should be handled via a listener or UserContext
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
