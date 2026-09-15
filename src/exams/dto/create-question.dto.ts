import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsInt()
  subjectId: number;

  @IsString()
  question: string;

  @IsIn(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER'])
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER';

  @IsNumber()
  marks: number;

  @IsOptional()
  @IsString()
  options?: string;

  @IsOptional()
  @IsString()
  answer?: string;
}