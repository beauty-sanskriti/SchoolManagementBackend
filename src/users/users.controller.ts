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

import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UserCodeService } from './user-code.service.js';
import { TwoFactorService } from './two-factor.service.js';
import {
  Enable2faDto,
  Verify2faDto,
} from './dto/enable-2fa.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userCodeService: UserCodeService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  // POST /users/:id/2fa/enable
  @Post(':id/2fa/enable')
  @UseGuards(JwtAuthGuard)
  enable2fa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Enable2faDto,
    @Request() req: any,
  ) {
    return this.twoFactorService.enable(id, dto.method, req.user);
  }

  // POST /users/:id/2fa/verify
  @Post(':id/2fa/verify')
  @UseGuards(JwtAuthGuard)
  verify2fa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Verify2faDto,
    @Request() req: any,
  ) {
    return this.twoFactorService.verify(id, dto.code, req.user);
  }

  // POST /users/:id/2fa/disable
  @Post(':id/2fa/disable')
  @UseGuards(JwtAuthGuard)
  disable2fa(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.twoFactorService.disable(id, req.user);
  }

  // GET /users/:id/sessions
  @Get(':id/sessions')
  @UseGuards(JwtAuthGuard)
  getSessions(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.twoFactorService.getSessions(id, req.user);
  }

  // DELETE /users/:id/sessions/:sessionId
  @Delete(':id/sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  revokeSession(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req: any,
  ) {
    return this.twoFactorService.revokeSession(
      id,
      sessionId,
      req.user,
    );
  }

  // GET /users/:id/user-code
  @Get(':id/user-code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  async getUserCode(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const user = await this.usersService.getUser(id, req.user);
    return { userCode: (user as any).userCode ?? null };
  }

  // GET /users/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) {
    return this.usersService.getMe(
      req.user.userId,
    );
  }

  // PATCH /users/me
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(
      req.user.userId,
      updateUserDto,
    );
  }

  // GET /users/role/:role
  @Get('role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getUsersByRole(
    @Param('role') role: string,
    @Request() req: any,
  ) {
    return this.usersService.getUsersByRole(
      role,
      req.user,
    );
  }

  // GET /users/admin-test
  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  adminTest(@Request() req: any) {
    return {
      message: 'School Admin access granted',
      user: req.user,
    };
  }

  // GET /users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getUsers(@Request() req: any) {
    return this.usersService.getUsers(
      req.user,
    );
  }

  // GET /users/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  getUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.usersService.getUser(
      id,
      req.user,
    );
  }

  // POST /users
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ) {
    return this.usersService.createUser(
      createUserDto,
      req.user,
    );
  }

  // PATCH /users/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.usersService.updateUser(
      id,
      updateUserDto,
      req.user,
    );
  }

  // DELETE /users/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.usersService.deleteUser(
      id,
      req.user,
    );
  }

  // PATCH /users/:id/role
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    return this.usersService.updateUserRole(
      id,
      updateUserRoleDto,
      req.user,
    );
  }
}