import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SubjectsController } from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [
    SubjectsController,
  ],
  providers: [
    SubjectsService,
  ],
})
export class SubjectsModule {}