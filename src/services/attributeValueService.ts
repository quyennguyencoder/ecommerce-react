import axios from 'axios';

import type {
  ApiResponse,
  AttributeValueCreateRequest,
  AttributeValueResponse,
  AttributeValueUpdateRequest,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const ATTRIBUTE_VALUES_PATH = '/api/v1/attribute-values';

export const attributeValueService = {
  async getAllAttributeValues() {
    const response = await api.get<ApiResponse<AttributeValueResponse[]>>(
      ATTRIBUTE_VALUES_PATH
    );
    return response.data;
  },

  async getAttributeValueById(id: number) {
    const response = await api.get<ApiResponse<AttributeValueResponse>>(
      `${ATTRIBUTE_VALUES_PATH}/${id}`
    );
    return response.data;
  },

  async getAttributeValuesByAttributeId(attributeId: number) {
    const response = await api.get<ApiResponse<AttributeValueResponse[]>>(
      `${ATTRIBUTE_VALUES_PATH}/attribute/${attributeId}`
    );
    return response.data;
  },

  async createAttributeValue(payload: AttributeValueCreateRequest) {
    const response = await api.post<ApiResponse<AttributeValueResponse>>(
      ATTRIBUTE_VALUES_PATH,
      payload
    );
    return response.data;
  },

  async updateAttributeValue(id: number, payload: AttributeValueUpdateRequest) {
    const response = await api.put<ApiResponse<AttributeValueResponse>>(
      `${ATTRIBUTE_VALUES_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async deleteAttributeValue(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${ATTRIBUTE_VALUES_PATH}/${id}`
    );
    return response.data;
  },
};
