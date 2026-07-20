import { PolicyEnum } from '../../Pages/teacher/my-assistants/assistants.model';

export type Role = 'student' | 'admin' | 'teacher' | 'assistant';

export interface User {
  id: string;
  fullName?: string;
  email: string;
  firstName: string;
  secondName: string;
  role: Role;
  permissions?: PolicyEnum[];
}
