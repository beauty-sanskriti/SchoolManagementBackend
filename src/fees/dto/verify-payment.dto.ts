import {
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class VerifyPaymentDto {
  @IsInt()
  paymentId: number;

  @IsString()
  transactionId: string;

  @IsOptional()
  @IsString()
  signature?: string;
}