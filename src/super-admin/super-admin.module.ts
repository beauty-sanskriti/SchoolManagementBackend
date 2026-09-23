import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SuperAdminController } from './super-admin.controller.js';
import { SuperAdminService } from './super-admin.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
