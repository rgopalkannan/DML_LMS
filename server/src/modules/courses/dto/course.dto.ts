import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { COURSE_LEVELS, type CourseLevel, type CourseStatus, type LessonType } from '../../../common/constants/domain';

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
const MAX_VALIDITY_MONTHS = 60;

export class CreateCourseRequestDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @Matches(/^[A-Z]{2,5}-\d{3}$/, { message: 'code must look like AML-101' })
  code!: string;

  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @Transform(trim)
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  summary!: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  category!: string;

  @IsIn(COURSE_LEVELS)
  level!: CourseLevel;

  @IsBoolean()
  requiredForNewStaff!: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_VALIDITY_MONTHS)
  certValidityMonths!: number;
}

export class SetCourseStatusRequestDto {
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status!: CourseStatus;
}

export interface CourseSummaryResponseDto {
  id: string;
  code: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  requiredForNewStaff: boolean;
  certValidityMonths: number;
  instructorName: string | null;
  lessonCount: number;
  totalMinutes: number;
  hasQuiz: boolean;
}

export interface LessonResponseDto {
  id: string;
  title: string;
  type: LessonType;
  body: string;
  videoUrl: string | null;
  durationMinutes: number;
}

export interface CourseDetailResponseDto extends CourseSummaryResponseDto {
  modules: { id: string; title: string; lessons: LessonResponseDto[] }[];
  quiz: { passPercent: number; questionCount: number } | null;
}
