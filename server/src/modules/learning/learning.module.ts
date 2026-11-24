import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

@Module({
  imports: [CoursesModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService]
})
export class LearningModule {}
