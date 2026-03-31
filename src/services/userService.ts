import axios from 'axios';

import type {
  ApiResponse,
  PaginationResponse,
  UserChangePasswordRequest,
  UserRegisterByEmailRequest,
  UserRegisterByPhoneRequest,
  UserResponse,
  UserUpdateRequest,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const USERS_PATH = '/api/v1/users';

export interface GetAllUsersParams {
  keyword?: string;
  role?: string;
  page?: number;
  size?: number;
}

export const userService = {
  async registerByEmail(payload: UserRegisterByEmailRequest) {
    const response = await api.post<ApiResponse<UserResponse>>(
      `${USERS_PATH}/register/email`,
      payload
    );
    return response.data;
  },

  async registerByPhone(payload: UserRegisterByPhoneRequest) {
    const response = await api.post<ApiResponse<UserResponse>>(
      `${USERS_PATH}/register/phone`,
      payload
    );
    return response.data;
  },

  async getUserById(id: number) {
    const response = await api.get<ApiResponse<UserResponse>>(`${USERS_PATH}/${id}`);
    return response.data;
  },

  async getAllUsers(params?: GetAllUsersParams) {
    const response = await api.get<ApiResponse<PaginationResponse<UserResponse>>>(
      USERS_PATH,
      { params }
    );
    return response.data;
  },

  async updateUser(id: number, payload: UserUpdateRequest) {
    const response = await api.put<ApiResponse<UserResponse>>(
      `${USERS_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async deleteUser(id: number) {
    const response = await api.delete<ApiResponse<void>>(`${USERS_PATH}/${id}`);
    return response.data;
  },

  async updateUserRole(userId: number, roleId: number) {
    const response = await api.put<ApiResponse<void>>(
      `${USERS_PATH}/${userId}/role/${roleId}`
    );
    return response.data;
  },

  async deactivateUser(id: number) {
    const response = await api.put<ApiResponse<void>>(`${USERS_PATH}/${id}/deactivate`);
    return response.data;
  },

  async activateUser(id: number) {
    const response = await api.put<ApiResponse<void>>(`${USERS_PATH}/${id}/activate`);
    return response.data;
  },

  async uploadAvatar(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.put<ApiResponse<UserResponse>>(
      `${USERS_PATH}/${id}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getAvatar(id: number) {
    const response = await api.get(`${USERS_PATH}/${id}/avatar`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  async changePassword(id: number, payload: UserChangePasswordRequest) {
    const response = await api.put<ApiResponse<void>>(
      `${USERS_PATH}/${id}/change-password`,
      payload
    );
    return response.data;
  },
};
