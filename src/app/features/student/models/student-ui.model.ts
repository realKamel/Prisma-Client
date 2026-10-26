/** Generic filter option for the student lessons grid */
export interface Filter<T = string> {
  key: T;
  label: string;
}
