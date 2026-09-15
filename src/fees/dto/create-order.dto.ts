import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  studentFeeId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;
}