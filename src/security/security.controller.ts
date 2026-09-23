import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { SecurityService } from './security.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('security')
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('sessions')
  getSessions(@Request() req: any) {
    return this.securityService.getSessions(req.user);
  }

  @Delete('sessions/:id')
  revokeSession(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.securityService.revokeSession(id, req.user);
  }

  @Get('login-history')
  loginHistory(@Request() req: any) {
    return this.securityService.loginHistory(req.user);
  }

  @Get('access-logs')
  accessLogs(@Request() req: any) {
    return this.securityService.accessLogs(req.user);
  }

  @Get('audit-logs')
  auditLogs() {
    return this.securityService.auditLogs();
  }

  @Post('2fa/setup')
  setup2fa(
    @Body('method') method: 'AUTHENTICATOR' | 'EMAIL',
    @Request() req: any,
  ) {
    return this.securityService.setup2fa(method, req.user);
  }

  @Post('2fa/verify')
  verify2fa(@Body('code') code: string, @Request() req: any) {
    return this.securityService.verify2fa(code, req.user);
  }

  @Post('2fa/disable')
  disable2fa(@Request() req: any) {
    return this.securityService.disable2fa(req.user);
  }
}
