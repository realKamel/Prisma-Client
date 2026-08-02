import { AppRole } from '../enums/role-enum';
import { PolicyEnum } from '../../features/teacher/pages/my-assistants/assistants.model';

/** Route data shape for the policy guard */
export interface PolicyRouteData {
  policies?: PolicyEnum[];
}

/** Route data shape for the role guard */
export interface RoleRouteData {
  roles?: AppRole[];
}
