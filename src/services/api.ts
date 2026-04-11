import axios, { AxiosHeaders, type AxiosRequestConfig } from 'axios';

import type { ApiResponse, RefreshTokenResponse } from '../types';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../utils/authStorage';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const AUTH_REFRESH_PATH = '/api/v1/auth/refresh-token';

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

const requestTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    return null;
  }

  try {
    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${API_BASE_URL}${AUTH_REFRESH_PATH}`,
      { refreshToken }
    );
    const data = response.data?.data;
    if (!data?.accessToken || !data?.refreshToken) {
      clearAuthSession();
      return null;
    }

    setAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    });

    return data.accessToken;
  } catch {
    clearAuthSession();
    return null;
  }
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !config.headers?.Authorization) {
    const headers = config.headers ?? new AxiosHeaders();
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? '').includes(AUTH_REFRESH_PATH)
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = requestTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (!newToken) {
        return Promise.reject(error);
      }

      const headers = originalRequest.headers ?? new AxiosHeaders();
      headers.set('Authorization', `Bearer ${newToken}`);
      originalRequest.headers = headers;

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
