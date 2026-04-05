import axios, { AxiosHeaders } from 'axios';

import { getAccessToken } from '../utils/authStorage';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !config.headers?.Authorization) {
    const headers = config.headers ?? new AxiosHeaders();
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

export default api;
