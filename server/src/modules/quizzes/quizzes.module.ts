import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { LearningModule } from '../learning/learning.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  imports: [AuthModule, LearningModule, CertificatesModule],
  controllers: [QuizzesController],
  providers: [QuizzesService]
})
export class QuizzesModule {}
