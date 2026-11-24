import { type Role } from '../constants/domain';

/** The signed-in user as known to a request, taken from a verified token and a live database check. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
