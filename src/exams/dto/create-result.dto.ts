import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateResultDto {
  @IsInt()
  examId: number;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsNumber()
  marks: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}