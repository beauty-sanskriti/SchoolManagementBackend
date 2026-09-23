import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ParentPortalController } from './parent-portal.controller.js';
import { ParentPortalService } from './parent-portal.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ParentPortalController],
  providers: [ParentPortalService],
})
export class ParentPortalModule {}
