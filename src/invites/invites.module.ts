import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { InvitesController } from './invites.controller.js';
import { InvitesService } from './invites.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
