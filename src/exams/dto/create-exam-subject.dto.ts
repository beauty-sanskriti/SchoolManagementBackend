import { IsInt, IsNumber } from 'class-validator';

export class CreateExamSubjectDto {
  @IsInt()
  subjectId: number;

  @IsNumber()
  maxMarks: number;

  @IsNumber()
  passMarks: number;
}