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

import { NotificationsService } from './notifications.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getNotifications(@Request() req: any) {
    return this.notificationsService.getNotifications(req.user);
  }

  @Post()
  createNotification(@Body() dto: any, @Request() req: any) {
    return this.notificationsService.createNotification(dto, req.user);
  }

  @Post('send-email')
  sendEmail(@Body() dto: any, @Request() req: any) {
    return this.notificationsService.sendEmail(dto, req.user);
  }

  @Post('send-sms')
  sendSms(@Body() dto: any, @Request() req: any) {
    return this.notificationsService.sendSms(dto, req.user);
  }

  @Post('send-push')
  sendPush(@Body() dto: any, @Request() req: any) {
    return this.notificationsService.sendPush(dto, req.user);
  }

  @Post('announcement')
  createAnnouncement(@Body() dto: any, @Request() req: any) {
    return this.notificationsService.createAnnouncement(dto, req.user);
  }

  @Get(':id')
  getNotification(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.notificationsService.getNotification(id, req.user);
  }

  @Patch(':id')
  updateNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.notificationsService.updateNotification(id, dto, req.user);
  }

  @Delete(':id')
  deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.notificationsService.deleteNotification(id, req.user);
  }
}
