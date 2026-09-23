import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { ReportsAnalyticsService } from './reports-analytics.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class ReportsAnalyticsController {
  constructor(
    private readonly reportsAnalyticsService: ReportsAnalyticsService,
  ) {}

  @Get('reports/students')
  studentsReport(@Request() req: any) {
    return this.reportsAnalyticsService.studentsReport(req.user);
  }

  @Get('reports/attendance')
  attendanceReport(@Request() req: any) {
    return this.reportsAnalyticsService.attendanceReport(req.user);
  }

  @Get('reports/exams')
  examsReport(@Request() req: any) {
    return this.reportsAnalyticsService.examsReport(req.user);
  }

  @Get('reports/fees')
  feesReport(@Request() req: any) {
    return this.reportsAnalyticsService.feesReport(req.user);
  }

  @Get('reports/teachers')
  teachersReport(@Request() req: any) {
    return this.reportsAnalyticsService.teachersReport(req.user);
  }

  @Get('reports/schools')
  @Roles('SUPER_ADMIN')
  schoolsReport() {
    return this.reportsAnalyticsService.schoolsReport();
  }

  @Get('analytics/dashboard')
  analyticsDashboard(@Request() req: any) {
    return this.reportsAnalyticsService.analyticsDashboard(req.user);
  }

  @Get('analytics/students')
  studentsAnalytics(@Request() req: any) {
    return this.reportsAnalyticsService.studentsAnalytics(req.user);
  }

  @Get('analytics/attendance')
  attendanceAnalytics(@Request() req: any) {
    return this.reportsAnalyticsService.attendanceAnalytics(req.user);
  }

  @Get('analytics/finance')
  financeAnalytics() {
    return this.reportsAnalyticsService.financeAnalytics();
  }

  @Get('analytics/exams')
  examsAnalytics(@Request() req: any) {
    return this.reportsAnalyticsService.examsAnalytics(req.user);
  }

  @Post('reports/custom')
  customReport(@Body() dto: any, @Request() req: any) {
    return this.reportsAnalyticsService.customReport(dto, req.user);
  }

  @Post('reports/export/pdf')
  exportPdf(@Body() dto: any, @Request() req: any) {
    return this.reportsAnalyticsService.exportPdf(dto, req.user);
  }

  @Post('reports/export/excel')
  exportExcel(@Body() dto: any, @Request() req: any) {
    return this.reportsAnalyticsService.exportExcel(dto, req.user);
  }
}
