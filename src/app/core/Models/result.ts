export interface IResult {
  succeeded: boolean;
  message: string;
  errors: Record<string, string[]> | null;
  data: any | null;
  meta: any | null;
}
