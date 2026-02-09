import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { PaymentsModule } from './payments/payments.module';
import { QuizzesService } from './quizzes/quizzes.service';
import { QuizzesController } from './quizzes/quizzes.controller';

@Module({
  imports: [PrismaModule, AuthModule, CoursesModule, PaymentsModule],
  controllers: [AppController, QuizzesController],
  providers: [AppService, QuizzesService],
})
export class AppModule {}
