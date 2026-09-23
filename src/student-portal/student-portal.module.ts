import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { StudentPortalController } from './student-portal.controller.js';
import { StudentPortalService } from './student-portal.service.js';

@Module({
  imports: [AuthModule],
  controllers: [StudentPortalController],
  providers: [StudentPortalService],
  exports: [StudentPortalService],
})
export class StudentPortalModule {}