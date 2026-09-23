import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { StudentPortalService } from './student-portal.service.js';

@Controller('student-portal')
@UseGuards(JwtAuthGuard)
export class StudentPortalController {
  constructor(
    private readonly studentPortalService: StudentPortalService,
  ) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.studentPortalService.getDashboard(req.user);
  }

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.studentPortalService.getProfile(req.user);
  }

  @Patch('profile')
  updateProfile(
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.studentPortalService.updateProfile(
      body,
      req.user,
    );
  }

  @Get('classes')
  getClasses(@Req() req: any) {
    return this.studentPortalService.getClasses(req.user);
  }

  @Get('timetable')
  getTimetable(@Req() req: any) {
    return this.studentPortalService.getTimetable(req.user);
  }

  @Get('assignments')
  getAssignments(@Req() req: any) {
    return this.studentPortalService.getAssignments(req.user);
  }

  @Get('assignments/:id')
  getAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.studentPortalService.getAssignment(
      id,
      req.user,
    );
  }

  @Post('assignments/:id/submit')
  submitAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.studentPortalService.submitAssignment(
      id,
      body,
      req.user,
    );
  }

  @Get('attendance')
  getAttendance(@Req() req: any) {
    return this.studentPortalService.getAttendance(req.user);
  }

  @Get('results')
  getResults(@Req() req: any) {
    return this.studentPortalService.getResults(req.user);
  }

  @Get('report-card')
  getReportCard(@Req() req: any) {
    return this.studentPortalService.getReportCard(req.user);
  }

  @Get('fees')
  getFees(@Req() req: any) {
    return this.studentPortalService.getFees(req.user);
  }

  @Get('payments')
  getPayments(@Req() req: any) {
    return this.studentPortalService.getPayments(req.user);
  }

  @Get('exams')
  getExams(@Req() req: any) {
    return this.studentPortalService.getExams(req.user);
  }

  @Get('exams/:id')
  getExam(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.studentPortalService.getExam(
      id,
      req.user,
    );
  }

  @Post('exams/:id/start')
  startExam(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.studentPortalService.startExam(
      id,
      req.user,
    );
  }

  @Post('exams/:id/submit')
  submitExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.studentPortalService.submitExam(
      id,
      body,
      req.user,
    );
  }

  @Get('notifications')
  getNotifications(@Req() req: any) {
    return this.studentPortalService.getNotifications(
      req.user,
    );
  }

  @Patch('notifications/:id/read')
  markNotificationRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.studentPortalService.markNotificationRead(
      id,
      req.user,
    );
  }

  @Patch('notifications/read-all')
  markAllNotificationsRead(@Req() req: any) {
    return this.studentPortalService.markAllNotificationsRead(
      req.user,
    );
  }
}