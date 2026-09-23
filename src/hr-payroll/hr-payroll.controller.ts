import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { HrPayrollService } from './hr-payroll.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class HrPayrollController {
  constructor(private readonly hrPayrollService: HrPayrollService) {}

  @Post('employees')
  createEmployee(@Body() dto: any, @Request() req: any) {
    return this.hrPayrollService.createEmployee(dto, req.user);
  }

  @Get('employees')
  getEmployees(@Request() req: any) {
    return this.hrPayrollService.getEmployees(req.user);
  }

  @Get('employees/:id')
  getEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.hrPayrollService.getEmployee(id);
  }

  @Patch('employees/:id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hrPayrollService.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  deleteEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.hrPayrollService.deleteEmployee(id);
  }

  @Post('employees/:id/leave')
  createLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hrPayrollService.createLeave(id, dto);
  }

  @Get('employees/:id/leave')
  getLeaves(@Param('id', ParseIntPipe) id: number) {
    return this.hrPayrollService.getLeaves(id);
  }

  @Patch('leave/:id')
  updateLeaveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ) {
    return this.hrPayrollService.updateLeaveStatus(id, status);
  }

  @Post('payroll')
  createPayroll(@Body() dto: any) {
    return this.hrPayrollService.createPayroll(dto);
  }

  @Get('payroll')
  getPayrolls() {
    return this.hrPayrollService.getPayrolls();
  }

  @Get('payroll/:id')
  getPayrollEntry(@Param('id', ParseIntPipe) id: number) {
    return this.hrPayrollService.getPayrollEntry(id);
  }

  @Patch('payroll/:id')
  updatePayroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hrPayrollService.updatePayroll(id, dto);
  }

  @Get('payroll/:id/salary-slip')
  getSalarySlip(@Param('id', ParseIntPipe) id: number) {
    return this.hrPayrollService.getSalarySlip(id);
  }
}
