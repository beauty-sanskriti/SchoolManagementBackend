import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAdmissionDto {
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  applicationNo?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
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