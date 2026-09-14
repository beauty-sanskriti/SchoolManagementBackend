import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, {
    message:
      'Please provide a valid email address',
  })
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message:
      'Phone number must be exactly 10 digits',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, {
    message:
      'Username must be at least 3 characters',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, {
    message:
      'Name must be at least 2 characters',
  })
  name?: string;
}