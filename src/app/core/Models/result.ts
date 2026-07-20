export interface IResult {
  succeeded: boolean;
  message: string;
  errors: { [key: string]: string[] } | null;
  data: any | null;
  meta: any | null;
}
