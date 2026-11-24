import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { LIMITS } from '../constants/domain';

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LIMITS.PAGE_SIZE_MAX)
  pageSize: number = LIMITS.PAGE_SIZE_DEFAULT;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export interface PageResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
