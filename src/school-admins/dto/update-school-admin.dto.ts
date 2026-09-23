import { IsOptional, IsString } from 'class-validator';

export class UpdateSchoolAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
