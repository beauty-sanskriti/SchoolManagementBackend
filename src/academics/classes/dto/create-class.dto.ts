import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateClassDto {
  @IsInt()
  schoolId: number;

  @IsInt()
  academicYearId: number;

  @IsString()
  @MinLength(2, {
    message: 'Class name must be at least 2 characters',
  })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1, {
    message: 'Class code must be at least 1 character',
  })
  code?: string;
}