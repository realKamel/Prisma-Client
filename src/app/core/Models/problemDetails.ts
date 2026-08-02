export interface IProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  // .NET specific validation error dictionary (e.g., from [ApiController] model validation)
  errors?: Record<string, string[]>;
  // Catch any extra dynamic properties included in ExtensionMembers
  [key: string]: unknown;
}
