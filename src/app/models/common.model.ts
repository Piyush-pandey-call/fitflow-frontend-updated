/** Mirrors com.fitflow.platform.common.dto.PageResponse<T> - returned by every paginated GET list endpoint. */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Common query params accepted by list endpoints like GET /members. */
export interface PageQuery {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
