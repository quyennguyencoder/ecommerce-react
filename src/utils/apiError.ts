import axios from 'axios';

/** Lấy thông báo lỗi từ axios hoặc fallback */
export function getApiErrorMessage(err: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined;
    if (body && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
