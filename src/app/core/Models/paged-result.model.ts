export interface PagedResult<T> {
  items: T[];
  pageNumber: number; // 0-based
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
