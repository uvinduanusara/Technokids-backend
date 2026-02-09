import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { type RequestWithUser } from '../auth/types/request-with-user.interface';

@Controller('courses')
@UseGuards(AuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.TEACHER)
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Post('enroll')
  @Roles(Role.TEACHER)
  async enroll(@Body() dto: EnrollStudentDto) {
    return await this.coursesService.enrollStudent(dto.courseId, dto.studentId);
  }

  @Get('enrolled')
  @Roles(Role.STUDENT, Role.TEACHER)
  async findEnrolled(@Request() req: RequestWithUser) {
    return this.coursesService.findEnrolledCourses(req.user.sub);
  }

  @Get()
  @Roles(Role.TEACHER) // Both can view
  findAll() {
    return this.coursesService.findAll();
  }
}
