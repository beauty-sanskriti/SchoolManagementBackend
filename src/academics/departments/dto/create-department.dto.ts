import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsInt()
  schoolId: number;

  @IsString()
  @MinLength(2, {
    message: 'Department name must be at least 2 characters',
  })
  name: string;

  @IsString()
  @MinLength(2, {
    message: 'Department code must be at least 2 characters',
  })
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}