import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { SchoolsController } from './schools.controller.js';
import { SchoolsService } from './schools.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
})
export class SchoolsModule {}