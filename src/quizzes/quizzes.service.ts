import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Prisma } from '@prisma/client';
import { Quiz } from '@prisma/client';

interface SubmittedAnswer {
  questionId: string;
  selectedOption: number;
}

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async createExam(userId: string, dto: CreateQuizDto): Promise<Quiz> {
    // Explicitly typing 'result' prevents unsafe assignment errors
    const result: Quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        description: dto.description,
        creatorId: userId,
        courseId: dto.courseId,
        questions: {
          create: dto.questions,
        },
      },
      include: {
        questions: true,
      },
    });

    return result;
  }

  async getMyExams(userId: string) {
    return this.prisma.quiz.findMany({
      where: { creatorId: userId },
      include: { _count: { select: { questions: true } } },
    });
  }

  async getExamsByCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: { _count: { select: { questions: true } } },
    });
  }

  // Replace any[] with SubmittedAnswer[]
  async submitAttempt(
    userId: string,
    quizId: string,
    submittedAnswers: SubmittedAnswer[],
  ) {
    // 1. CHECK IF ATTEMPT ALREADY EXISTS
    const existingAttempt = await this.prisma.attempt.findFirst({
      where: {
        studentId: userId,
        quizId: quizId,
      },
    });

    if (existingAttempt) {
      throw new BadRequestException('You have already submitted this exam.');
    }

    // 2. Fetch the quiz
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    let totalScore = 0;

    // 2. Calculate the score
    submittedAnswers.forEach((submission) => {
      const question = quiz.questions.find(
        (q) => q.id === submission.questionId, // Now safe!
      );
      if (question && question.correctAnswer === submission.selectedOption) {
        // Now safe!
        totalScore += question.points;
      }
    });

    // 3. Save the attempt - Use await to satisfy the linter
    return await this.prisma.attempt.create({
      data: {
        studentId: userId,
        quizId: quizId,
        answers: submittedAnswers as unknown as Prisma.InputJsonValue[],
        score: totalScore,
        isCompleted: true,
      },
    });
  }
  async getExamForStudent(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            points: true,
            // Notice: correctAnswer is EXCLUDED here
          },
        },
      },
    });

    if (!quiz) throw new Error('Exam not found');
    return quiz;
  }
}
