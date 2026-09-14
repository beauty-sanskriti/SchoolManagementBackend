import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsString()
  @MinLength(4, {
    message:
      'Academic year name must be at least 4 characters',
  })
  name?: string;

  @IsOptional()
  @IsDateString({}, {
    message:
      'Please provide a valid start date',
  })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, {
    message:
      'Please provide a valid end date',
  })
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}