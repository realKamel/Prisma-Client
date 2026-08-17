import { PolicyEnum } from '../../../features/teacher/pages/my-assistants/assistants.model';

/** Navigation item used in the staff sidebar */
export interface NavItem {
  id: string;
  labelKey: string;
  route: string;
  icon: string;
  permission?: PolicyEnum;
}

/** Navigation link used in the top navbar */
export interface NavLink {
  labelKey: string;
  path: string;
  fragment?: string;
  icon: string;
}

/** Profile dropdown link */
export interface ProfileLink {
  labelKey: string;
  path: string;
  icon: string;
}

/** Breadcrumb trail entry */
export interface Breadcrumb {
  label: string;
  url?: string | unknown[];
}
