import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AcademicYearsController } from './academic-years.controller.js';
import { AcademicYearsService } from './academic-years.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [
    AcademicYearsController,
  ],
  providers: [
    AcademicYearsService,
  ],
})
export class AcademicYearsModule {}