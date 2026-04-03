import type {
  ApiResponse,
  AttributeCreateRequest,
  AttributeResponse,
  AttributeUpdateRequest,
} from '../types';

import api from './api';

const ATTRIBUTES_PATH = '/api/v1/attributes';

export const attributeService = {
  async getAllAttributes() {
    const response = await api.get<ApiResponse<AttributeResponse[]>>(
      ATTRIBUTES_PATH
    );
    return response.data;
  },

  async getAttributeById(id: number) {
    const response = await api.get<ApiResponse<AttributeResponse>>(
      `${ATTRIBUTES_PATH}/${id}`
    );
    return response.data;
  },

  async createAttribute(payload: AttributeCreateRequest) {
    const response = await api.post<ApiResponse<AttributeResponse>>(
      ATTRIBUTES_PATH,
      payload
    );
    return response.data;
  },

  async updateAttribute(id: number, payload: AttributeUpdateRequest) {
    const response = await api.put<ApiResponse<AttributeResponse>>(
      `${ATTRIBUTES_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async deleteAttribute(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${ATTRIBUTES_PATH}/${id}`
    );
    return response.data;
  },
};
