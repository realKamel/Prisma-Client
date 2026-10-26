/** Result wrapper used by the Codes service (supports fallback data) */
export interface CodesApiResult<T> {
  data: T;
  fromFallback: boolean;
}
