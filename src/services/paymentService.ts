import type {
  ApiResponse,
  PaymentUrlCreateRequest,
  PaymentUrlCreateResponse,
  TransactionResponse,
} from '../types';

import api from './api';

const PAYMENTS_PATH = '/api/v1/payments';

export const paymentService = {
  async createPaymentUrl(request: PaymentUrlCreateRequest) {
    const response = await api.post<ApiResponse<PaymentUrlCreateResponse>>(
      `${PAYMENTS_PATH}/create-payment-url`,
      request
    );
    return response.data;
  },

  async queryTransaction(transactionId: number) {
    const response = await api.get<ApiResponse<TransactionResponse>>(
      `${PAYMENTS_PATH}/query/${transactionId}`
    );
    return response.data;
  },
};
