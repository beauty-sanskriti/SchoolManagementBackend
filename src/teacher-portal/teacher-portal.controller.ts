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

import { TeacherPortalService } from './teacher-portal.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherPortalController {
  constructor(
    private readonly teacherPortalService: TeacherPortalService,
  ) {}

  // GET /teachers/:id/dashboard
  @Get('teachers/:id/dashboard')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  dashboard(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teacherPortalService.dashboard(id, req.user);
  }

  // GET /teachers/:id/assignments
  @Get('teachers/:id/assignments')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getTeacherAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.teacherPortalService.getTeacherAssignments(id);
  }

  // POST /assignments
  @Post('assignments')
  @Roles('TEACHER')
  createAssignment(@Body() dto: any, @Request() req: any) {
    return this.teacherPortalService.createAssignment(dto, req.user);
  }

  // GET /assignments
  @Get('assignments')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getAssignments(@Request() req: any) {
    return this.teacherPortalService.getAssignments(req.user);
  }

  // GET /assignments/:id
  @Get('assignments/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.teacherPortalService.getAssignment(id);
  }

  // PATCH /assignments/:id
  @Patch('assignments/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.teacherPortalService.updateAssignment(id, dto, req.user);
  }

  // DELETE /assignments/:id
  @Delete('assignments/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  deleteAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teacherPortalService.deleteAssignment(id, req.user);
  }

  // POST /assignments/:id/submit
  @Post('assignments/:id/submit')
  @Roles('STUDENT')
  submitAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.teacherPortalService.submitAssignment(id, dto, req.user);
  }

  // GET /assignments/:id/submissions
  @Get('assignments/:id/submissions')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getSubmissions(@Param('id', ParseIntPipe) id: number) {
    return this.teacherPortalService.getSubmissions(id);
  }

  // PATCH /submissions/:id
  @Patch('submissions/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.teacherPortalService.gradeSubmission(id, dto);
  }

  // GET /teacher/examinations
  @Get('teacher/examinations')
  @Roles('TEACHER')
  getExaminations(@Request() req: any) {
    return this.teacherPortalService.getExaminations(req.user);
  }

  // POST /teacher/examinations/:id/evaluate
  @Post('teacher/examinations/:id/evaluate')
  @Roles('TEACHER')
  evaluateExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.teacherPortalService.evaluateExam(id, dto);
  }

  // GET /teacher/communication
  @Get('teacher/communication')
  @Roles('TEACHER')
  getCommunication(@Request() req: any) {
    return this.teacherPortalService.getCommunication(req.user);
  }

  // GET /teacher/salary
  @Get('teacher/salary')
  @Roles('TEACHER')
  getSalary(@Request() req: any) {
    return this.teacherPortalService.getSalary(req.user);
  }

  // GET /teacher/profile
  @Get('teacher/profile')
  @Roles('TEACHER')
  getProfile(@Request() req: any) {
    return this.teacherPortalService.getProfile(req.user);
  }
}
