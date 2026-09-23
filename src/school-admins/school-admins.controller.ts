import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsInt } from 'class-validator';

import { SchoolAdminsService } from './school-admins.service.js';
import { AcceptInviteDto } from '../invites/dto/accept-invite.dto.js';
import { SetPasswordDto } from './dto/set-password.dto.js';
import { UpdateSchoolAdminDto } from './dto/update-school-admin.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

class InviteSchoolAdminDto {
  @IsInt()
  schoolId: number;

  @IsEmail()
  email: string;
}

@Controller('school-admins')
export class SchoolAdminsController {
  constructor(
    private readonly schoolAdminsService: SchoolAdminsService,
  ) {}

  // POST /school-admins/invite
  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  inviteSchoolAdmin(
    @Body() dto: InviteSchoolAdminDto,
    @Request() req: any,
  ) {
    return this.schoolAdminsService.inviteSchoolAdmin(
      dto.schoolId,
      dto.email,
      req.user,
    );
  }

  // POST /school-admins/invite/accept
  @Post('invite/accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.schoolAdminsService.acceptInvite(dto);
  }

  // POST /school-admins/invite/resend
  @Post('invite/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  resendInvite(
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.schoolAdminsService.resendInvite(email, req.user);
  }

  // POST /school-admins/set-password
  @Post('set-password')
  setPassword(@Body() dto: SetPasswordDto) {
    return this.schoolAdminsService.setPassword(dto);
  }

  // GET /school-admins/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getSchoolAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.schoolAdminsService.getSchoolAdmin(id, req.user);
  }

  // PATCH /school-admins/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateSchoolAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSchoolAdminDto,
    @Request() req: any,
  ) {
    return this.schoolAdminsService.updateSchoolAdmin(
      id,
      dto,
      req.user,
    );
  }
}
