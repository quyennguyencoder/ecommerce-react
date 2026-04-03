import type {
  ApiResponse,
  PaginationResponse,
  UserChangePasswordRequest,
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from '../types';

import api from './api';

const USERS_PATH = '/api/v1/users';

export interface GetAllUsersParams {
  keyword?: string;
  role?: string;
  page?: number;
  size?: number;
}

export const userService = {
  async createUser(payload: UserCreateRequest) {
    const response = await api.post<ApiResponse<UserResponse>>(
      `${USERS_PATH}`,
      payload
    );
    return response.data;
  },

  async getUserById(id: number) {
    const response = await api.get<ApiResponse<UserResponse>>(`${USERS_PATH}/${id}`);
    return response.data;
  },

  async getMyProfile() {
    const response = await api.get<ApiResponse<UserResponse>>(
      `${USERS_PATH}/my-profile`
    );
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

  async changePassword(id: number, payload: UserChangePasswordRequest) {
    const response = await api.put<ApiResponse<void>>(
      `${USERS_PATH}/${id}/change-password`,
      payload
    );
    return response.data;
  },
};
