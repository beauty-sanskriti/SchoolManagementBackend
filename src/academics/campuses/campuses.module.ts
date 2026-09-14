import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { CampusesController } from './campuses.controller.js';
import { CampusesService } from './campuses.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [
    CampusesController,
  ],
  providers: [
    CampusesService,
  ],
})
export class CampusesModule {}