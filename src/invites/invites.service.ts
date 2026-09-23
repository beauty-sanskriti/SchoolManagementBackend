import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { BrevoClient } from '@getbrevo/brevo';

import { db } from '../prisma/db.js';
import { UserCodeService } from '../users/user-code.service.js';
import { CreateInviteDto } from './dto/create-invite.dto.js';
import { AcceptInviteDto } from './dto/accept-invite.dto.js';

const INVITE_TYPE_LABEL: Record<string, string> = {
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
};

function generateTempPassword(): string {
  return crypto.randomBytes(8).toString('base64url').slice(0, 10);
}

@Injectable()
export class InvitesService {
  private readonly brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY || '',
  });

  constructor(
    private readonly userCodeService: UserCodeService,
  ) {}

  private async sendCredentialsEmail(
    email: string,
    type: string,
    tempPassword: string,
  ) {
    const loginUrl = `${
      process.env.APP_URL || 'http://localhost:3000'
    }/login`;

    const roleLabel = INVITE_TYPE_LABEL[type] || type;

    try {
      await this.brevo.transactionalEmails.sendTransacEmail({
        sender: {
          email: process.env.BREVO_FROM_EMAIL || '',
          name: process.env.BREVO_FROM_NAME || 'School Management',
        },
        to: [{ email }],
        subject: `Your ${roleLabel} account is ready`,
        htmlContent: `
          <div>
            <h2>Your ${roleLabel} account has been created</h2>
            <p>You can now log in with the details below:</p>
            <p>
              <b>Login page:</b> <a href="${loginUrl}">${loginUrl}</a><br/>
              <b>Email:</b> ${email}<br/>
              <b>Temporary password:</b> ${tempPassword}
            </p>
            <p>For security, please change this password after your first
            login (Settings &rarr; Change Password).</p>
          </div>
        `,
      });
    } catch {
    }
  }

  private async provisionAccount(
    schoolId: number,
    email: string,
    type: 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT',
    tempPassword: string,
  ) {
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const userCode = await this.userCodeService.generateUserCode(type);

    const user = await db.orm.public.User.create({
      schoolId,
      email,
      password: hashedPassword,
      role: type,
      userCode,
      emailVerified: true,
    });

    if (type === 'TEACHER') {
      await db.orm.public.Teacher.create({
        schoolId,
        userId: user.id,
        employeeNo: userCode ?? `TCH-${user.id}`,
      });
    }

    if (type === 'PARENT') {
      await db.orm.public.Parent.create({
        schoolId,
        userId: user.id,
      });
    }

    return user;
  }

  // POST /invites
  async createInvite(
    dto: CreateInviteDto,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      dto.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only invite users to your own school',
      );
    }

    const school = await db.orm.public.School
      .where({ id: dto.schoolId })
      .first();

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const existingUser = await db.orm.public.User
      .where({ email: dto.email })
      .first();

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists',
      );
    }

    const tempPassword = generateTempPassword();

    await this.provisionAccount(
      dto.schoolId,
      dto.email,
      dto.type,
      tempPassword,
    );

    const token = crypto.randomBytes(32).toString('hex');

    const invite = await db.orm.public.Invite.create({
      schoolId: dto.schoolId,
      senderId: currentUser.userId,
      email: dto.email,
      type: dto.type,
      status: 'ACCEPTED',
      token,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      acceptedAt: new Date().toISOString(),
    });

    await this.sendCredentialsEmail(dto.email, dto.type, tempPassword);

    return {
      message: `Invite email sent to ${dto.email}`,
      invite: {
        id: invite.id,
        email: invite.email,
        type: invite.type,
        status: invite.status,
      },
    };
  }

  // GET /invites
  async getInvites(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Invite.all();
    }

    return db.orm.public.Invite
      .where({ schoolId: currentUser.schoolId })
      .all();
  }

  // GET /invites/:token
  async getInviteByToken(token: string) {
    const invite = await db.orm.public.Invite
      .where({ token })
      .first();

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return invite;
  }

  // POST /invites/accept
  async acceptInvite(dto: AcceptInviteDto) {
    const invite = await db.orm.public.Invite
      .where({ token: dto.token })
      .first();

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status === 'REVOKED') {
      throw new BadRequestException('This invite has been revoked');
    }

    const user = await db.orm.public.User
      .where({ email: invite.email })
      .first();

    if (!user) {
      throw new NotFoundException(
        'No account found for this invite — accounts are now created ' +
          'immediately when the invite is sent',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await db.orm.public.User
      .where({ id: user.id })
      .update({
        name: dto.name,
        password: hashedPassword,
      });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // POST /invites/resend
  async resendInvite(
    email: string,
    currentUser: any,
  ) {
    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      throw new NotFoundException(
        'No account found for this email',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      user.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only resend invites for your own school',
      );
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.orm.public.User
      .where({ id: user.id })
      .update({ password: hashedPassword });

    const latestInvite = await db.orm.public.Invite
      .where({ email })
      .first();

    if (latestInvite) {
      await db.orm.public.Invite
        .where({ id: latestInvite.id })
        .update({
          token: crypto.randomBytes(32).toString('hex'),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
    }

    await this.sendCredentialsEmail(
      email,
      user.role,
      tempPassword,
    );

    return { message: 'New credentials generated and emailed' };
  }

  // POST /invites/revoke
  async revokeInvite(
    email: string,
    currentUser: any,
  ) {
    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      throw new NotFoundException(
        'No account found for this email',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      user.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only revoke invites for your own school',
      );
    }

    const latestInvite = await db.orm.public.Invite
      .where({ email })
      .first();

    if (latestInvite) {
      await db.orm.public.Invite
        .where({ id: latestInvite.id })
        .update({ status: 'REVOKED' });
    }

    const lockedPassword = await bcrypt.hash(
      crypto.randomBytes(16).toString('hex'),
      10,
    );

    await db.orm.public.User
      .where({ id: user.id })
      .update({ password: lockedPassword });

    return { message: 'Invite revoked and account access removed' };
  }
}
