import type {
  ApiResponse,
  AuthLoginRequest,
  AuthRefreshTokenRequest,
  AuthUrlResponse,
  LoginResponse,
  RefreshTokenResponse,
  SocialLoginType,
} from '../types';

import api from './api';

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

  async generateSocialAuthUrl(socialLoginType: SocialLoginType) {
    const response = await api.get<ApiResponse<AuthUrlResponse>>(
      `${AUTH_PATH}/social-login/${socialLoginType}`
    );
    return response.data;
  },

  async socialLoginCallback(socialLoginType: SocialLoginType, code: string) {
    const response = await api.get<ApiResponse<LoginResponse>>(
      `${AUTH_PATH}/callback/${socialLoginType}`,
      { params: { code } }
    );
    return response.data;
  },
};
