import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { type RequestWithUser } from '../auth/types/request-with-user.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(req.user.sub, createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('my-payments')
  findMyPayments(@Req() req: RequestWithUser) {
    return this.paymentsService.findByUser(req.user.sub);
  }
}
