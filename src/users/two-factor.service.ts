import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as crypto from 'crypto';

import { db } from '../prisma/db.js';

function checkOwnAccount(id: number, currentUser: any) {
  if (
    currentUser.role !== 'SUPER_ADMIN' &&
    currentUser.userId !== id
  ) {
    throw new ForbiddenException(
      'You can only manage 2FA for your own account',
    );
  }
}

@Injectable()
export class TwoFactorService {
  // POST /users/:id/2fa/enable
  async enable(
    id: number,
    method: 'AUTHENTICATOR' | 'EMAIL',
    currentUser: any,
  ) {
    checkOwnAccount(id, currentUser);

    const secret =
      method === 'AUTHENTICATOR'
        ? crypto.randomBytes(16).toString('hex')
        : null;

    const existing = await db.orm.public.TwoFactorAuth
      .where({ userId: id })
      .first();

    if (existing) {
      await db.orm.public.TwoFactorAuth
        .where({ id: existing.id })
        .update({ method, secret, enabled: false });
    } else {
      await db.orm.public.TwoFactorAuth.create({
        userId: id,
        method,
        secret,
        enabled: false,
      });
    }

    return {
      message:
        'Two-factor authentication setup started, verify to enable it',
      method,
      secret,
    };
  }

  // POST /users/:id/2fa/verify
  async verify(
    id: number,
    code: string,
    currentUser: any,
  ) {
    checkOwnAccount(id, currentUser);

    const record = await db.orm.public.TwoFactorAuth
      .where({ userId: id })
      .first();

    if (!record) {
      throw new NotFoundException(
        'Two-factor authentication has not been set up',
      );
    }

    if (!code) {
      throw new BadRequestException('Verification code is required');
    }

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex'),
    );

    await db.orm.public.TwoFactorAuth
      .where({ id: record.id })
      .update({
        enabled: true,
        backupCodes: JSON.stringify(backupCodes),
      });

    return {
      message: 'Two-factor authentication enabled',
      backupCodes,
    };
  }

  // POST /users/:id/2fa/disable
  async disable(id: number, currentUser: any) {
    checkOwnAccount(id, currentUser);

    const record = await db.orm.public.TwoFactorAuth
      .where({ userId: id })
      .first();

    if (!record) {
      throw new NotFoundException(
        'Two-factor authentication has not been set up',
      );
    }

    await db.orm.public.TwoFactorAuth
      .where({ id: record.id })
      .update({ enabled: false, secret: null, backupCodes: null });

    return { message: 'Two-factor authentication disabled' };
  }

  // GET /users/:id/sessions
  async getSessions(id: number, currentUser: any) {
    checkOwnAccount(id, currentUser);

    return db.orm.public.Session
      .where({ userId: id })
      .all();
  }

  // DELETE /users/:id/sessions/:sessionId
  async revokeSession(
    id: number,
    sessionId: number,
    currentUser: any,
  ) {
    checkOwnAccount(id, currentUser);

    const session = await db.orm.public.Session
      .where({ id: sessionId, userId: id })
      .first();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await db.orm.public.Session
      .where({ id: sessionId })
      .update({ status: 'REVOKED' });

    return { message: 'Session revoked successfully' };
  }
}
