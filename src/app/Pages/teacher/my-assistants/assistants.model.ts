export interface AssistantPermissions {
  CanManageContent: boolean;
  CanManageAssessments: boolean;
  CanEvaluateStudents: boolean;
  CanManageEnrollments: boolean;
  CanViewReports: boolean;
}

export interface Assistant {
  id: number;
  name: string;
  phone: string;
  isActive: boolean;
  permissions: AssistantPermissions;
}
