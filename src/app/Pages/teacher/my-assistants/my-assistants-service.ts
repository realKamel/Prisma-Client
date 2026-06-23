import { Service, signal } from '@angular/core';
import { Assistant, AssistantPermissions } from './assistants.model';

@Service()
export class MyAssistantsService {
  assistants = signal<Assistant[]>([
    {
      id: 1,
      name: 'سلمى أحمد',
      phone: '01000000001',
      isActive: true,
      permissions: {
        CanEvaluateStudents: true,
        CanManageContent: false,
        CanViewReports: false,
        CanManageAssessments: true,
        CanManageEnrollments: false,
      },
    },
    {
      id: 2,
      name: 'كريم طارق',
      phone: '01000000002',
      isActive: true,
      permissions: {
        CanEvaluateStudents: true,
        CanManageContent: true,
        CanViewReports: false,
        CanManageAssessments: false,
        CanManageEnrollments: false,
      },
    },
  ]);

  addAssistant(assistant: Omit<Assistant, 'id' | 'isActive'>) {
    const newAssistant: Assistant = {
      ...assistant,
      id: Date.now(),
      isActive: true,
    };
    this.assistants.update((list) => [...list, newAssistant]);
  }

  removeAssistant(id: number) {
    this.assistants.update((list) => list.filter((a) => a.id !== id));
  }

  togglePermission(id: number, key: keyof AssistantPermissions) {
    this.assistants.update((list) =>
      list.map((a) =>
        a.id === id ? { ...a, permissions: { ...a.permissions, [key]: !a.permissions[key] } } : a,
      ),
    );
  }
}
