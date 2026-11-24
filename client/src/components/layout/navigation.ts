import { ROUTES } from '@/constants/routes';
import type { Role } from '@/types/api';

export interface NavItem {
  label: string;
  to: string;
  roles: Role[];
}

const EVERYONE: Role[] = ['ADMIN', 'INSTRUCTOR', 'LEARNER'];

/** Menu entries by role. The server enforces the same rules; this only hides what a user cannot use. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: ROUTES.home, roles: EVERYONE },
  { label: 'Course catalog', to: ROUTES.catalog, roles: EVERYONE },
  { label: 'My learning', to: ROUTES.myLearning, roles: EVERYONE },
  { label: 'Certificates', to: ROUTES.certificates, roles: EVERYONE },
  { label: 'Manage courses', to: ROUTES.adminCourses, roles: ['ADMIN', 'INSTRUCTOR'] },
  { label: 'Users', to: ROUTES.adminUsers, roles: ['ADMIN'] }
];
