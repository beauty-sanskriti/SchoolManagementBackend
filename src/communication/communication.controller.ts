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

import { CommunicationService } from './communication.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(
    private readonly communicationService: CommunicationService,
  ) {}

  @Post('conversations')
  createConversation(@Body() dto: any, @Request() req: any) {
    return this.communicationService.createConversation(dto, req.user);
  }

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.communicationService.getConversations(req.user);
  }

  @Get('conversations/:id')
  getConversation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.communicationService.getConversation(id, req.user);
  }

  @Delete('conversations/:id')
  deleteConversation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.communicationService.deleteConversation(id, req.user);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.communicationService.getMessages(id, req.user);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.communicationService.sendMessage(id, dto, req.user);
  }

  @Patch('messages/:id')
  updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.communicationService.updateMessage(id, dto, req.user);
  }

  @Delete('messages/:id')
  deleteMessage(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.communicationService.deleteMessage(id, req.user);
  }
}
