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

import { TeachersService } from './teachers.service.js';

import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';

import { InvitesService } from '../invites/invites.service.js';
import { AcceptInviteDto } from '../invites/dto/accept-invite.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { IsEmail, IsInt } from 'class-validator';

class InviteTeacherDto {
  @IsInt()
  schoolId: number;

  @IsEmail()
  email: string;
}

@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly invitesService: InvitesService,
  ) {}

  // POST /teachers/invite
  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  inviteTeacher(
    @Body() dto: InviteTeacherDto,
    @Request() req: any,
  ) {
    return this.invitesService.createInvite(
      { ...dto, type: 'TEACHER' },
      req.user,
    );
  }

  // POST /teachers/invite/accept
  @Post('invite/accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(dto);
  }

  // POST /teachers/invite/resend
  @Post('invite/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  resendInvite(
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.invitesService.resendInvite(email, req.user);
  }

  // POST /teachers/:id/generate-account
  @Post(':id/generate-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  generateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.generateAccount(id, req.user);
  }

  // GET /teachers/:id/salary
  @Get(':id/salary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getSalary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getSalary(id, req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createTeacher(
    @Body() dto: CreateTeacherDto,
    @Request() req: any,
  ) {
    return this.teachersService.createTeacher(
      dto,
      req.user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getTeachers(@Request() req: any) {
    return this.teachersService.getTeachers(
      req.user,
    );
  }

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getProfile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getProfile(
      id,
      req.user,
    );
  }

  @Get(':id/classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getClasses(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getClasses(
      id,
      req.user,
    );
  }

  @Get(':id/subjects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getSubjects(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getSubjects(
      id,
      req.user,
    );
  }

  @Get(':id/timetable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getTimetable(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getTimetable(
      id,
      req.user,
    );
  }

  @Get(':id/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getAttendance(
      id,
      req.user,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  getTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getTeacher(
      id,
      req.user,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
    @Request() req: any,
  ) {
    return this.teachersService.updateTeacher(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  deleteTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.deleteTeacher(
      id,
      req.user,
    );
  }
}