import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateSectionDto {
  @IsInt()
  classId: number;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;
}