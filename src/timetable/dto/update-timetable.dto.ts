import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateTimetableDto {
  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsInt()
  sectionId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  day?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  endTime?: string;

  @IsOptional()
  @IsString()
  room?: string;
}