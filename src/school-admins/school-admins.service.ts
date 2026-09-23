import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { db } from '../prisma/db.js';
import { InvitesService } from '../invites/invites.service.js';
import { CreateInviteDto } from '../invites/dto/create-invite.dto.js';
import { AcceptInviteDto } from '../invites/dto/accept-invite.dto.js';
import { SetPasswordDto } from './dto/set-password.dto.js';
import { UpdateSchoolAdminDto } from './dto/update-school-admin.dto.js';

@Injectable()
export class SchoolAdminsService {
  constructor(
    private readonly invitesService: InvitesService,
  ) {}

  // POST /school-admins/invite
  inviteSchoolAdmin(
    schoolId: number,
    email: string,
    currentUser: any,
  ) {
    const dto: CreateInviteDto = {
      schoolId,
      email,
      type: 'SCHOOL_ADMIN',
    };

    return this.invitesService.createInvite(dto, currentUser);
  }

  // POST /school-admins/invite/accept
  acceptInvite(dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(dto);
  }

  // POST /school-admins/invite/resend
  resendInvite(email: string, currentUser: any) {
    return this.invitesService.resendInvite(email, currentUser);
  }

  // POST /school-admins/set-password
  async setPassword(dto: SetPasswordDto) {
    const invite = await db.orm.public.Invite
      .where({ token: dto.token, type: 'SCHOOL_ADMIN' })
      .first();

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    const user = await db.orm.public.User
      .where({ email: invite.email })
      .first();

    if (!user) {
      throw new BadRequestException(
        'No account found for this invite yet, use /school-admins/invite/accept instead',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await db.orm.public.User
      .where({ id: user.id })
      .update({ password: hashedPassword });

    return { message: 'Password set successfully' };
  }

  // GET /school-admins/:id
  async getSchoolAdmin(id: number, currentUser: any) {
    const admin = await db.orm.public.User
      .where({ id, role: 'SCHOOL_ADMIN' })
      .first();

    if (!admin) {
      throw new NotFoundException('School admin not found');
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      admin.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access admins from your own school',
      );
    }

    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  // PATCH /school-admins/:id
  async updateSchoolAdmin(
    id: number,
    dto: UpdateSchoolAdminDto,
    currentUser: any,
  ) {
    await this.getSchoolAdmin(id, currentUser);

    await db.orm.public.User
      .where({ id })
      .update({ ...dto });

    return this.getSchoolAdmin(id, currentUser);
  }
}
