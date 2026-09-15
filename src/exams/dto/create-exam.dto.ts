import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateExamDto {
  @IsInt()
  schoolId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'])
  status?: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
}