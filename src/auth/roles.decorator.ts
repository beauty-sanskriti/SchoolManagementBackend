import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (
  ...roles: (
    | 'SUPER_ADMIN'
    | 'SCHOOL_ADMIN'
    | 'TEACHER'
    | 'STUDENT'
    | 'PARENT'
  )[]
) => SetMetadata(ROLES_KEY, roles);