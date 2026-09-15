import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}