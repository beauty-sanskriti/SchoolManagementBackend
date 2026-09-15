import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateResultDto {
  @IsOptional()
  @IsNumber()
  marks?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}