import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ParentsController } from './parents.controller.js';
import { ParentsService } from './parents.service.js';
import { InvitesModule } from '../invites/invites.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    InvitesModule,
    AuthModule,
  ],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
