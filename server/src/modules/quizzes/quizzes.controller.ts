import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/auth.decorators';
import { type AuthUser } from '../../common/types/auth-user';
import { type AttemptResultResponseDto, type QuizDrawResponseDto, SubmitAttemptRequestDto } from './dto/quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('courses/:courseId/quiz')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  /** Questions without their answers. */
  @Post('draw')
  @HttpCode(HttpStatus.OK)
  async draw(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseUUIDPipe) courseId: string
  ): Promise<QuizDrawResponseDto> {
    const draw = await this.quizzes.draw(user, courseId);
    return {
      drawToken: draw.drawToken,
      passPercent: draw.passPercent,
      questions: draw.questions.map(question => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        options: question.options.map(option => ({ id: option.id, label: option.label }))
      }))
    };
  }

  @Post('attempts')
  @HttpCode(HttpStatus.OK)
  async submit(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() body: SubmitAttemptRequestDto
  ): Promise<AttemptResultResponseDto> {
    const answers = body.answers.map(answer => ({
      questionId: answer.questionId,
      optionIds: answer.optionIds,
      text: answer.text ?? null
    }));
    const outcome = await this.quizzes.submit(user, courseId, body.drawToken, body.idempotencyKey, answers);
    return {
      attemptId: outcome.attemptId,
      score: outcome.score,
      total: outcome.total,
      percent: outcome.percent,
      passed: outcome.passed,
      passPercent: outcome.passPercent,
      certificateId: outcome.certificateId,
      results: outcome.results
    };
  }
}
