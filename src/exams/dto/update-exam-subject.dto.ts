import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateExamSubjectDto {
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  passMarks?: number;
}