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

import { TransportService } from './transport.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('transport')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post('buses')
  createBus(@Body() dto: any, @Request() req: any) {
    return this.transportService.createBus(dto, req.user);
  }

  @Get('buses')
  getBuses(@Request() req: any) {
    return this.transportService.getBuses(req.user);
  }

  @Get('buses/:id')
  getBus(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.getBus(id);
  }

  @Patch('buses/:id')
  updateBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.transportService.updateBus(id, dto);
  }

  @Delete('buses/:id')
  deleteBus(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.deleteBus(id);
  }

  @Post('drivers')
  createDriver(@Body() dto: any, @Request() req: any) {
    return this.transportService.createDriver(dto, req.user);
  }

  @Get('drivers')
  getDrivers(@Request() req: any) {
    return this.transportService.getDrivers(req.user);
  }

  @Patch('drivers/:id')
  updateDriver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.transportService.updateDriver(id, dto);
  }

  @Delete('drivers/:id')
  deleteDriver(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.deleteDriver(id);
  }

  @Post('routes')
  createRoute(@Body() dto: any, @Request() req: any) {
    return this.transportService.createRoute(dto, req.user);
  }

  @Get('routes')
  getRoutes(@Request() req: any) {
    return this.transportService.getRoutes(req.user);
  }

  @Patch('routes/:id')
  updateRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.transportService.updateRoute(id, dto);
  }

  @Delete('routes/:id')
  deleteRoute(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.deleteRoute(id);
  }

  @Post('locations')
  recordLocation(@Body() dto: any) {
    return this.transportService.recordLocation(dto);
  }

  @Get('buses/:id/location')
  getLocation(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.getLatestLocation(id);
  }

  @Get('buses/:id/live')
  getLiveLocation(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.getLiveLocation(id);
  }
}
