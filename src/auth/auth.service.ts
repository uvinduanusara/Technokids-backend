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
  ) {}

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
}
