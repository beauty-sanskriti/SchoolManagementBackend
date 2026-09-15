import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BulkAttendanceItemDto {
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

export class BulkAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceItemDto)
  records: BulkAttendanceItemDto[];
}