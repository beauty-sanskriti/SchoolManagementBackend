import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateInviteDto {
  @IsInt()
  schoolId: number;

  @IsEmail()
  email: string;

  @IsEnum(['SCHOOL_ADMIN', 'TEACHER', 'PARENT'])
  type: 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT';

  @IsOptional()
  @IsInt()
  studentId?: number;
}
