import { IsIn } from 'class-validator';

export class UpdateSchoolStatusDto {
  @IsIn(
    ['ACTIVE', 'INACTIVE'],
    {
      message:
        'Status must be ACTIVE or INACTIVE',
    },
  )
  status: string;
}