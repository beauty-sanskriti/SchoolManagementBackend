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

import { ParentsService } from './parents.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('parents')
export class ParentsController {
  constructor(
    private readonly parentsService: ParentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createParent(@Body() dto: any) {
    return this.parentsService.createParent(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getParents(@Request() req: any) {
    return this.parentsService.getParents(req.user);
  }

  // POST /parents/invite
  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  inviteParent(
    @Body('schoolId', ParseIntPipe) schoolId: number,
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.parentsService.inviteParent(schoolId, email, req.user);
  }

  // POST /parents/verify
  @Post('verify')
  verifyParent(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    return this.parentsService.verifyParent(email, otp);
  }

  // POST /parents/link-student
  @Post('link-student')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT')
  linkStudent(
    @Body('parentUserId', ParseIntPipe) parentUserId: number,
    @Body('studentId', ParseIntPipe) studentId: number,
    @Body('relation') relation: string,
    @Request() req: any,
  ) {
    return this.parentsService.linkStudent(
      parentUserId,
      studentId,
      relation,
      req.user,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getParent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.parentsService.getParent(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateParent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.parentsService.updateParent(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  deleteParent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.parentsService.deleteParent(id, req.user);
  }
}
