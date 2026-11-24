import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { type Role } from '../../../common/constants/domain';
import { LIMITS } from '../../../common/constants/domain';

const trimLower = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginRequestDto {
  @Transform(trimLower)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(LIMITS.PASSWORD_MAX_LENGTH)
  password!: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
