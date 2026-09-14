import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdmissionDto {
  @IsInt()
  schoolId: number;

  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsString()
  @MinLength(1)
  applicationNo: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}