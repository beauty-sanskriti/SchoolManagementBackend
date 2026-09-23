import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { TeachersController } from './teachers.controller.js';
import { TeachersService } from './teachers.service.js';
import { InvitesModule } from '../invites/invites.module.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    InvitesModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
