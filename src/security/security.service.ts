import { Injectable, NotFoundException } from '@nestjs/common';

import { db } from '../prisma/db.js';
import { TwoFactorService } from '../users/two-factor.service.js';

@Injectable()
export class SecurityService {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  // GET /security/sessions
  getSessions(currentUser: any) {
    return this.twoFactorService.getSessions(currentUser.userId, currentUser);
  }

  // DELETE /security/sessions/:id
  revokeSession(id: number, currentUser: any) {
    return this.twoFactorService.revokeSession(
      currentUser.userId,
      id,
      currentUser,
    );
  }

  // GET /security/login-history
  async loginHistory(currentUser: any) {
    const logs = await db.orm.public.AuditLog.where({
      userId: currentUser.userId,
      action: 'LOGIN',
    }).all();

    return logs;
  }

  // GET /security/access-logs
  async accessLogs(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.AuditLog.all();
    }
    return db.orm.public.AuditLog.where({ userId: currentUser.userId }).all();
  }

  // GET /security/audit-logs
  async auditLogs() {
    return db.orm.public.AuditLog.all();
  }

  // POST /security/2fa/setup
  setup2fa(method: 'AUTHENTICATOR' | 'EMAIL', currentUser: any) {
    return this.twoFactorService.enable(currentUser.userId, method, currentUser);
  }

  // POST /security/2fa/verify
  verify2fa(code: string, currentUser: any) {
    return this.twoFactorService.verify(currentUser.userId, code, currentUser);
  }

  // POST /security/2fa/disable
  disable2fa(currentUser: any) {
    return this.twoFactorService.disable(currentUser.userId, currentUser);
  }
}
