import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { type AuthUser } from '../../common/types/auth-user';
import { toCourseDetailResponse, toCourseSummaryResponse } from './course.mapper';
import { CoursesService } from './courses.service';
import {
  type CourseDetailResponseDto,
  type CourseSummaryResponseDto,
  CreateCourseRequestDto,
  SetCourseStatusRequestDto
} from './dto/course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  async list(@CurrentUser() viewer: AuthUser): Promise<CourseSummaryResponseDto[]> {
    return (await this.courses.list(viewer)).map(toCourseSummaryResponse);
  }

  @Get(':id')
  async get(@CurrentUser() viewer: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<CourseDetailResponseDto> {
    return toCourseDetailResponse(await this.courses.get(viewer, id));
  }

  @Post()
  @Roles('ADMIN', 'INSTRUCTOR')
  async create(
    @CurrentUser() actor: AuthUser,
    @Body() body: CreateCourseRequestDto
  ): Promise<CourseSummaryResponseDto> {
    return toCourseSummaryResponse(await this.courses.create(actor, body));
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'INSTRUCTOR')
  async setStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetCourseStatusRequestDto
  ): Promise<CourseDetailResponseDto> {
    return toCourseDetailResponse(await this.courses.setStatus(actor, id, body.status));
  }
}
