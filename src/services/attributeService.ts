import axios from 'axios';

import type {
  ApiResponse,
  AttributeCreateRequest,
  AttributeResponse,
  AttributeUpdateRequest,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
