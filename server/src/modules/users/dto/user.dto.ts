import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LIMITS, ROLES, type Role } from '../../../common/constants/domain';

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
const trimLower = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** At least one letter and one digit, so a password is not a plain word or a plain number. */
const PASSWORD_RULE = /^(?=.*\p{L})(?=.*\d).+$/u;

export class CreateUserRequestDto {
  @Transform(trimLower)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(LIMITS.NAME_MAX_LENGTH)
  name!: string;

  @IsIn(ROLES)
  role!: Role;

  @IsString()
  @MinLength(LIMITS.PASSWORD_MIN_LENGTH)
  @MaxLength(LIMITS.PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_RULE, { message: 'password must contain at least one letter and one number' })
  password!: string;
}

export class UpdateUserRequestDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(LIMITS.NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
