import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Class name must be at least 2 characters',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, {
    message: 'Class code must be at least 1 character',
  })
  code?: string;
}