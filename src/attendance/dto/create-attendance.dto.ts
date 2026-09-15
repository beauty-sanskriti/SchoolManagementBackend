import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  studentId: number;

  @IsInt()
  classId: number;

  @IsOptional()
  @IsInt()
  sectionId?: number;

  @IsString()
  date: string;

  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'])
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';

  @IsOptional()
  @IsString()
  remarks?: string;
}