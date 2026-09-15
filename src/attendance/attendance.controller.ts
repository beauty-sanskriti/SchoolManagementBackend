import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AttendanceService } from './attendance.service.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('attendance')
  create(@Body() dto: CreateAttendanceDto, @Req() req: any) {
    return this.attendanceService.create(dto, req.user);
  }

  @Get('attendance')
  findAll(@Req() req: any) {
    return this.attendanceService.findAll(req.user);
  }

  @Get('attendance/report')
  report(
    @Req() req: any,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.report(
      req.user,
      classId ? Number(classId) : undefined,
      sectionId ? Number(sectionId) : undefined,
      date,
    );
  }

  @Post('attendance/bulk')
  bulk(@Body() dto: BulkAttendanceDto, @Req() req: any) {
    return this.attendanceService.bulk(dto, req.user);
  }

  @Get('students/:id/attendance')
  studentAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.attendanceService.studentAttendance(id, req.user);
  }

  @Get('classes/:id/attendance')
  classAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.attendanceService.classAttendance(id, req.user);
  }

  @Get('attendance/:id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.attendanceService.findOne(id, req.user);
  }

  @Patch('attendance/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
    @Req() req: any,
  ) {
    return this.attendanceService.update(id, dto, req.user);
  }

  @Delete('attendance/:id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.attendanceService.remove(id, req.user);
  }
}