export interface ApiResponse<T> {
  status?: string;
  message?: string;
  data?: T;
}

export interface PaginationResponse<T> {
  currentPage?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  content?: T[];
}
