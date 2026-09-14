import {
  IsEnum,
} from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'STUDENT',
    'PARENT',
  ], {
    message: 'Invalid user role',
  })
  role: string;
}