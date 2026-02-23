import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(data: RegisterDto) {
    const { password, dob, ...rest } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert dob to Date object if present, otherwise undefined (allows Prisma to set null)
    // Also handle empty string which might come from frontend form
    const birthDate = dob && dob !== '' ? new Date(dob) : undefined;

    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          dob: birthDate,
          password: hashedPassword,
        },
      });
      return { message: 'User created successfully', userId: user.id };
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new BadRequestException(errorMessage || 'Username already exists');
    }
  }

  async login(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getAllStudents() {
    return this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        level: true,
        grade: true,
        address: true,
        dob: true,
        contactNo: true,
        whatsappNo: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      }
    });
  }

  async updateStudent(id: string, data: any) {
    const { name, contactNo, grade, level, address } = data;
    return this.prisma.user.update({
      where: { id },
      data: {
        name,
        contactNo,
        grade,
        level,
        address,
      },
    });
  }

  async deleteStudent(id: string) {
    // Delete related records first to avoid foreign key constraints

    // 1. Delete Enrollments
    await this.prisma.enrollment.deleteMany({
      where: { userId: id },
    });

    // 2. Delete Payments
    await this.prisma.payment.deleteMany({
      where: { studentId: id },
    });

    // 3. Delete Attempts (Quiz results)
    await this.prisma.attempt.deleteMany({
      where: { studentId: id },
    });

    // 4. Finally, delete the User
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
