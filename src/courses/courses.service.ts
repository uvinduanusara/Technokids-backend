import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a standalone course
  async create(data: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        ...data,
        // No studentId or teacherId here anymore
      },
    });
  }

  // 2. Find all courses and include the enrolled students
  async findAll() {
    return this.prisma.course.findMany({
      include: {
        enrollments: {
          include: {
            user: { select: { name: true, username: true } },
          },
        },
      },
    });
  }

  // 3. Link a student to a course via the Enrollment table
  async enrollStudent(courseId: string, studentId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Create enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          courseId,
          userId: studentId,
        },
      });

      // Create pending payment
      await tx.payment.create({
        data: {
          amount: 0,
          status: 'PENDING',
          studentId,
          courseId,
        },
      });

      return enrollment;
    });
  }
}
