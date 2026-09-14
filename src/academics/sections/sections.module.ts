import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SectionsController } from './sections.controller.js';
import { SectionsService } from './sections.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [
    SectionsController,
  ],
  providers: [
    SectionsService,
  ],
})
export class SectionsModule {}