import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: createPaymentDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const isAmountSufficient = createPaymentDto.amount >= course.price;
    const status = isAmountSufficient ? 'COMPLETED' : 'PENDING';

    // Check if there is already a payment for this user and course
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        studentId: userId,
        courseId: createPaymentDto.courseId,
      },
    });

    if (existingPayment) {
      return this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: createPaymentDto.amount,
          status: status,
        },
        include: {
          student: { select: { id: true, username: true, name: true } },
          course: { select: { title: true } },
        },
      });
    }

    return this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        status: status,
        student: { connect: { id: userId } },
        course: { connect: { id: createPaymentDto.courseId } },
      },
      include: {
        student: { select: { id: true, username: true, name: true } },
        course: { select: { title: true } },
      },
    });
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        student: { select: { id: true, username: true, name: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { studentId: userId },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
