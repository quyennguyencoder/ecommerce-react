import axios from 'axios';

import type {
  ApiResponse,
  AuthLoginRequest,
  AuthRefreshTokenRequest,
  LoginResponse,
  RefreshTokenResponse,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const AUTH_PATH = '/api/v1/auth';

export const authService = {
  async login(payload: AuthLoginRequest) {
    const response = await api.post<ApiResponse<LoginResponse>>(
      `${AUTH_PATH}/login`,
      payload
    );
    return response.data;
  },

  async logout(token: string) {
    const response = await api.post<ApiResponse<void>>(
      `${AUTH_PATH}/logout`,
      null,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async refreshToken(payload: AuthRefreshTokenRequest) {
    const response = await api.post<ApiResponse<RefreshTokenResponse>>(
      `${AUTH_PATH}/refresh-token`,
      payload
    );
    return response.data;
  },
};
