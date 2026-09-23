import { IsEnum, IsOptional, IsString } from 'class-validator';

export class Enable2faDto {
  @IsEnum(['AUTHENTICATOR', 'EMAIL'])
  method: 'AUTHENTICATOR' | 'EMAIL';
}

export class Verify2faDto {
  @IsString()
  code: string;
}
