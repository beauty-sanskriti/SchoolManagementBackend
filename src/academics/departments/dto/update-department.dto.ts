import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Department name must be at least 2 characters',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Department code must be at least 2 characters',
  })
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;
}