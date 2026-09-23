import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { TeacherPortalController } from './teacher-portal.controller.js';
import { TeacherPortalService } from './teacher-portal.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [TeacherPortalController],
  providers: [TeacherPortalService],
})
export class TeacherPortalModule {}
