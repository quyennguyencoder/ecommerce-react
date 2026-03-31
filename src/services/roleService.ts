import axios from 'axios';

import type { ApiResponse, RoleResponse } from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const ROLES_PATH = '/api/v1/roles';

export const roleService = {
  async getAllRoles() {
    const response = await api.get<ApiResponse<RoleResponse[]>>(ROLES_PATH);
    return response.data;
  },
};
