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

import { HostelService } from './hostel.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post('hostels')
  createHostel(@Body() dto: any, @Request() req: any) {
    return this.hostelService.createHostel(dto, req.user);
  }

  @Get('hostels')
  getHostels(@Request() req: any) {
    return this.hostelService.getHostels(req.user);
  }

  @Get('hostels/:id')
  getHostel(@Param('id', ParseIntPipe) id: number) {
    return this.hostelService.getHostel(id);
  }

  @Patch('hostels/:id')
  updateHostel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hostelService.updateHostel(id, dto);
  }

  @Delete('hostels/:id')
  deleteHostel(@Param('id', ParseIntPipe) id: number) {
    return this.hostelService.deleteHostel(id);
  }

  @Post('hostels/:id/rooms')
  createRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hostelService.createRoom(id, dto);
  }

  @Get('hostels/:id/rooms')
  getRooms(@Param('id', ParseIntPipe) id: number) {
    return this.hostelService.getRooms(id);
  }

  @Patch('hostel-rooms/:id')
  updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hostelService.updateRoom(id, dto);
  }

  @Post('hostel-allocations')
  allocate(@Body() dto: any) {
    return this.hostelService.allocate(dto);
  }

  @Get('hostel-allocations')
  getAllocations() {
    return this.hostelService.getAllocations();
  }

  @Patch('hostel-allocations/:id')
  updateAllocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.hostelService.updateAllocation(id, dto);
  }
}
