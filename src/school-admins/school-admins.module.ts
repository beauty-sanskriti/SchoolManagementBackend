import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SchoolAdminsController } from './school-admins.controller.js';
import { SchoolAdminsService } from './school-admins.service.js';
import { InvitesModule } from '../invites/invites.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    InvitesModule,
  ],
  controllers: [SchoolAdminsController],
  providers: [SchoolAdminsService],
})
export class SchoolAdminsModule {}
