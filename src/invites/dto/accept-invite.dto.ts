import {
  IsString,
  MinLength,
} from 'class-validator';

export class AcceptInviteDto {
  @IsString()
  token: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters',
  })
  password: string;
}
