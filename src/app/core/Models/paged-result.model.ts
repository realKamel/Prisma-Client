export interface PagedResult<T> {
  items: T[];
  pageNumber: number; // 1-based
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
