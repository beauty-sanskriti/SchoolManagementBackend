import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTimetableDto {
  @IsInt()
  schoolId: number;

  @IsInt()
  classId: number;

  @IsOptional()
  @IsInt()
  sectionId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsInt()
  subjectId: number;

  @IsString()
  @MinLength(1)
  day: string;

  @IsString()
  @MinLength(1)
  startTime: string;

  @IsString()
  @MinLength(1)
  endTime: string;

  @IsOptional()
  @IsString()
  room?: string;
}