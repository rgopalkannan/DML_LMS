import { type User } from '../../domain/entities';
import { type UserResponseDto } from '../auth/dto/auth.dto';

export const toUserResponse = (user: User): UserResponseDto => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt.toISOString()
});
