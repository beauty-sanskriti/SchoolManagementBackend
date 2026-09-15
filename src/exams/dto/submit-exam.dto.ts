import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExamAnswerDto {
  @IsInt()
  questionId: number;

  @IsOptional()
  @IsString()
  answer?: string;
}

export class SubmitExamDto {
  @IsInt()
  attemptId: number;

  @ValidateNested({ each: true })
  @Type(() => ExamAnswerDto)
  answers: ExamAnswerDto[];
}