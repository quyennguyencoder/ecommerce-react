import type {
  ApiResponse,
  AttributeValueCreateRequest,
  AttributeValueResponse,
  AttributeValueUpdateRequest,
} from '../types';

import api from './api';

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
