import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { type RequestWithUser } from '../auth/types/request-with-user.interface';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quizzes')
@UseGuards(AuthGuard, RolesGuard) // Entire controller is protected
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @Roles(Role.TEACHER)
  async create(@Req() req: RequestWithUser, @Body() dto: CreateQuizDto) {
    // req.user comes from the JwtStrategy we built
    return this.quizzesService.createExam(req.user.sub, dto);
  }

  @Get('my-exams')
  async getMyExams(@Req() req: RequestWithUser) {
    return this.quizzesService.getMyExams(req.user.sub);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  async submit(
    @Req() req: RequestWithUser,
    @Param('id') quizId: string,
    @Body() dto: SubmitQuizDto, // Use the DTO here
  ) {
    return await this.quizzesService.submitAttempt(
      req.user.sub,
      quizId,
      dto.answers,
    );
  }
}
