import { type Role } from '../../common/constants/domain';
import { type User, type UserWithCredentials } from '../../domain/entities';

export interface NewUser {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
}

export interface UserChanges {
  name?: string;
  role?: Role;
  isActive?: boolean;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmailWithCredentials(email: string): Promise<UserWithCredentials | null>;
  existsByEmail(email: string): Promise<boolean>;
  list(query: { page: number; pageSize: number; search?: string }): Promise<Page<User>>;
  create(user: NewUser): Promise<User>;
  update(id: string, changes: UserChanges): Promise<User>;
}
