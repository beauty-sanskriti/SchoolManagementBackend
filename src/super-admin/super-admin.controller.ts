import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SuperAdminService } from './super-admin.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.superAdminService.dashboard();
  }

  @Get('schools')
  getSchools() {
    return this.superAdminService.getSchools();
  }

  @Post('schools')
  createSchool(@Body() dto: any) {
    return this.superAdminService.createSchool(dto);
  }

  @Get('schools/:id')
  getSchool(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getSchool(id);
  }

  @Patch('schools/:id')
  updateSchool(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.superAdminService.updateSchool(id, dto);
  }

  @Delete('schools/:id')
  deleteSchool(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.deleteSchool(id);
  }

  @Patch('schools/:id/status')
  updateSchoolStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.superAdminService.updateSchoolStatus(id, status);
  }

  @Get('schools/:id/users')
  getSchoolUsers(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getSchoolUsers(id);
  }

  @Get('schools/:id/students')
  getSchoolStudents(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getSchoolStudents(id);
  }

  @Get('schools/:id/teachers')
  getSchoolTeachers(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getSchoolTeachers(id);
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.superAdminService.getSubscriptions();
  }

  @Get('payments')
  getPayments() {
    return this.superAdminService.getPayments();
  }

  @Get('users')
  getUsers() {
    return this.superAdminService.getUsers();
  }

  @Get('reports')
  getReports() {
    return this.superAdminService.getReports();
  }

  @Get('support')
  getSupportTickets() {
    return this.superAdminService.getSupportTickets();
  }

  @Get('settings')
  getSettings() {
    return this.superAdminService.getSettings();
  }

  @Get('activity-logs')
  getActivityLogs() {
    return this.superAdminService.getActivityLogs();
  }

  @Get('analytics')
  getAnalytics() {
    return this.superAdminService.getAnalytics();
  }
}
