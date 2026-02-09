import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentDto {
    @IsString()
    courseId: string;

    @IsNumber()
    amount: number;

    @IsEnum(['PENDING', 'COMPLETED', 'FAILED'])
    @IsOptional()
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}
