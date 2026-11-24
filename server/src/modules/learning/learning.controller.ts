import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/auth.decorators';
import { type AuthUser } from '../../common/types/auth-user';
import { type CourseProgressResponseDto, type MyCourseResponseDto } from './dto/learning.dto';
import { toMyCourseResponse, toProgressResponse } from './learning.mapper';
import { LearningService } from './learning.service';

@Controller()
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('me/courses')
  async myCourses(@CurrentUser() user: AuthUser): Promise<MyCourseResponseDto[]> {
    return (await this.learning.myCourses(user)).map(toMyCourseResponse);
  }

  @Get('courses/:courseId/progress')
  async progress(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseUUIDPipe) courseId: string
  ): Promise<CourseProgressResponseDto> {
    return toProgressResponse(await this.learning.progress(user, courseId));
  }

  @Post('courses/:courseId/enrollment')
  @HttpCode(HttpStatus.OK)
  async enroll(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseUUIDPipe) courseId: string
  ): Promise<CourseProgressResponseDto> {
    return toProgressResponse(await this.learning.enroll(user, courseId));
  }

  @Post('courses/:courseId/lessons/:lessonId/complete')
  @HttpCode(HttpStatus.OK)
  async completeLesson(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string
  ): Promise<CourseProgressResponseDto> {
    return toProgressResponse(await this.learning.completeLesson(user, courseId, lessonId));
  }
}
