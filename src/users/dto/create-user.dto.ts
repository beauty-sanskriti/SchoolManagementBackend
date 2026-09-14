import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsInt()
  schoolId: number;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'STUDENT',
    'PARENT',
  ])
  role: string;
}