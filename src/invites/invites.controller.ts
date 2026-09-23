import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { InvitesService } from './invites.service.js';
import { CreateInviteDto } from './dto/create-invite.dto.js';
import { AcceptInviteDto } from './dto/accept-invite.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('invites')
export class InvitesController {
  constructor(
    private readonly invitesService: InvitesService,
  ) {}

  // POST /invites
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createInvite(
    @Body() dto: CreateInviteDto,
    @Request() req: any,
  ) {
    return this.invitesService.createInvite(dto, req.user);
  }

  // GET /invites
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getInvites(@Request() req: any) {
    return this.invitesService.getInvites(req.user);
  }

  // GET /invites/:token
  @Get(':token')
  getInvite(@Param('token') token: string) {
    return this.invitesService.getInviteByToken(token);
  }

  // POST /invites/accept
  @Post('accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(dto);
  }

  // POST /invites/resend
  @Post('resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  resendInvite(
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.invitesService.resendInvite(email, req.user);
  }

  // POST /invites/revoke
  @Post('revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  revokeInvite(
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.invitesService.revokeInvite(email, req.user);
  }
}
