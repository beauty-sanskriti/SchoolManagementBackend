import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAcademicYearDto {
  @IsInt()
  schoolId: number;

  @IsString()
  @MinLength(4, {
    message:
      'Academic year name must be at least 4 characters',
  })
  name: string;

  @IsDateString({}, {
    message:
      'Please provide a valid start date',
  })
  startDate: string;

  @IsDateString({}, {
    message:
      'Please provide a valid end date',
  })
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}