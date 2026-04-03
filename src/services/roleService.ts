import type { ApiResponse, RoleResponse } from '../types';

import api from './api';

const ROLES_PATH = '/api/v1/roles';

export const roleService = {
  async getAllRoles() {
    const response = await api.get<ApiResponse<RoleResponse[]>>(ROLES_PATH);
    return response.data;
  },
};
