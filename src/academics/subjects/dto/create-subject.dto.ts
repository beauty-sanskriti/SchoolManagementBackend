import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateSubjectDto {
  @IsInt()
  schoolId: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}