import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { HrPayrollController } from './hr-payroll.controller.js';
import { HrPayrollService } from './hr-payroll.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [HrPayrollController],
  providers: [HrPayrollService],
})
export class HrPayrollModule {}
