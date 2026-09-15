import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsIn(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER'])
  type?: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER';

  @IsOptional()
  @IsNumber()
  marks?: number;

  @IsOptional()
  @IsString()
  options?: string;

  @IsOptional()
  @IsString()
  answer?: string;
}