import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateCampusDto {
  @IsInt()
  schoolId: number;

  @IsString()
  @MinLength(2, {
    message:
      'Campus name must be at least 2 characters',
  })
  name: string;

  @IsString()
  @MinLength(2, {
    message:
      'Campus code must be at least 2 characters',
  })
  code: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
