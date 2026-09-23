import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';

import { SettingsService } from './settings.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user);
  }

  @Patch()
  updateSettings(@Body() dto: any, @Request() req: any) {
    return this.settingsService.updateSettings(dto, req.user);
  }

  @Get('branding')
  getBranding(@Request() req: any) {
    return this.settingsService.getBranding(req.user);
  }

  @Patch('branding')
  updateBranding(@Body() dto: any, @Request() req: any) {
    return this.settingsService.updateBranding(dto, req.user);
  }

  @Get('permissions')
  getPermissions(@Request() req: any) {
    return this.settingsService.getPermissions(req.user);
  }

  @Patch('permissions')
  updatePermissions(@Body() permissions: any, @Request() req: any) {
    return this.settingsService.updatePermissions(permissions, req.user);
  }

  @Get('integrations')
  getIntegrations(@Request() req: any) {
    return this.settingsService.getIntegrations(req.user);
  }

  @Patch('integrations')
  updateIntegrations(@Body() integrations: any, @Request() req: any) {
    return this.settingsService.updateIntegrations(integrations, req.user);
  }
}
