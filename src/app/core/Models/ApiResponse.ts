export interface ApiResponse<T> {
  succeeded: boolean;
  message:   string;
  data:      T | null;
  meta:      unknown | null;
  errors:    Record<string, string[]> | null;
}
