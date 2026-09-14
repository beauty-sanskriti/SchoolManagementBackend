import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AdmissionsController } from './admissions.controller.js';
import { AdmissionsService } from './admissions.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
})
export class AdmissionsModule {}