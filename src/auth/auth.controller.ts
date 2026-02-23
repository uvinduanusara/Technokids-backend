import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @Get('students')
  getAllStudents() {
    return this.authService.getAllStudents();
  }

  @Patch('students/:id')
  updateStudent(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateStudent(id, body);
  }

  @Delete('students/:id')
  deleteStudent(@Param('id') id: string) {
    return this.authService.deleteStudent(id);
  }
}
