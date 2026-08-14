export interface AssistantPermissions {
  CanManageContent: boolean;
  CanManageAssessments: boolean;
  CanEvaluateStudents: boolean;
  CanManageEnrollments: boolean;
  CanViewReports: boolean;
}

export enum PolicyEnum {
  CanManageContent = 'CanManageContent',
  CanManageAssessments = 'CanManageAssessments',
  CanEvaluateStudents = 'CanEvaluateStudents',
  CanManageEnrollments = 'CanManageEnrollments',
  CanViewReports = 'CanViewReports',
}
export interface Assistant {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  isActive: boolean;
  permissions: AssistantPermissions;
}

export interface Policy {
  title?: string;
  policyName?: boolean;
  isChecked?: boolean;
  description?: string;
}

export interface CreateAssistantCommand {
  firstName: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  password: string;
  policies: string[];
}

// Command for updating an existing assistant (password optional on edit)
export interface UpdateAssistantCommand {
  firstName: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  policies: string[];
}

// 2. CreateAssistantCommandResponse
export interface CreateOrUpdateAssistantCommandResponse {
  id: string;
  email: string;
  firstName: string;
  secondName: string;
  phoneNumber: string;
  policies: string[];
}
