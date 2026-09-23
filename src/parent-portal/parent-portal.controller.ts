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

import { ParentPortalService } from './parent-portal.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class ParentPortalController {
  constructor(
    private readonly parentPortalService: ParentPortalService,
  ) {}

  @Get('dashboard')
  dashboard(@Request() req: any) {
    return this.parentPortalService.dashboard(req.user);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.parentPortalService.getProfile(req.user);
  }

  @Patch('profile')
  updateProfile(@Body() dto: any, @Request() req: any) {
    return this.parentPortalService.updateProfile(dto, req.user);
  }

  @Get('children')
  getChildren(@Request() req: any) {
    return this.parentPortalService.getChildren(req.user);
  }

  @Get('children/:id')
  getChild(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.parentPortalService.getChild(id, req.user);
  }

  @Get('attendance')
  getAttendance(@Request() req: any) {
    return this.parentPortalService.getAttendance(req.user);
  }

  @Get('fees')
  getFees(@Request() req: any) {
    return this.parentPortalService.getFees(req.user);
  }

  @Get('payments')
  getPayments(@Request() req: any) {
    return this.parentPortalService.getPayments(req.user);
  }

  @Get('results')
  getResults(@Request() req: any) {
    return this.parentPortalService.getResults(req.user);
  }

  @Get('assignments')
  getAssignments(@Request() req: any) {
    return this.parentPortalService.getAssignments(req.user);
  }

  @Get('notifications')
  getNotifications(@Request() req: any) {
    return this.parentPortalService.getNotifications(req.user);
  }

  @Get('transport')
  getTransport(@Request() req: any) {
    return this.parentPortalService.getTransport(req.user);
  }

  @Get('communication')
  getCommunication(@Request() req: any) {
    return this.parentPortalService.getCommunication(req.user);
  }

  @Post('communication')
  sendMessage(
    @Body('conversationId', ParseIntPipe) conversationId: number,
    @Body('message') message: string,
    @Request() req: any,
  ) {
    return this.parentPortalService.sendMessage(
      conversationId,
      message,
      req.user,
    );
  }
}
