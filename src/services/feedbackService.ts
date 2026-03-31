import axios from 'axios';

import type {
  ApiResponse,
  FeedbackCreateRequest,
  FeedbackResponse,
  PaginationResponse,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const FEEDBACKS_PATH = '/api/v1/feedbacks';

export interface GetAllFeedbacksParams {
  productId?: number;
  page?: number;
  size?: number;
}

export const feedbackService = {
  async getAllFeedbacks(params?: GetAllFeedbacksParams) {
    const response = await api.get<ApiResponse<PaginationResponse<FeedbackResponse>>>(
      FEEDBACKS_PATH,
      { params }
    );
    return response.data;
  },

  async getFeedbackById(id: number) {
    const response = await api.get<ApiResponse<FeedbackResponse>>(
      `${FEEDBACKS_PATH}/${id}`
    );
    return response.data;
  },

  async createFeedback(payload: FeedbackCreateRequest) {
    const response = await api.post<ApiResponse<FeedbackResponse>>(
      FEEDBACKS_PATH,
      payload
    );
    return response.data;
  },
};
