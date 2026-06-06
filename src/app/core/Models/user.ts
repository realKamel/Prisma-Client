export type Role = 'student' | 'admin' | 'teacher' | 'assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
