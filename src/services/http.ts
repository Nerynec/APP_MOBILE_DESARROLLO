import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { tokenStorage } from '../utils/storage';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  try {
    const isLogin = (config.url ?? '').includes('/auth/login');
    if (!isLogin) {
      const token = await tokenStorage.get();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    if (config.data && !(config.headers as any)?.['Content-Type']) {
      config.headers = config.headers ?? {};
      (config.headers as any)['Content-Type'] = 'application/json';
    }
  } catch { /* no bloquees la request si falla leer el token */ }
  return config;
});
