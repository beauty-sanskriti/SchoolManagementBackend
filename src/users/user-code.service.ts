import { Injectable } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class UserCodeService {
  async generateUserCode(
    role: string,
  ): Promise<string | undefined> {
    const prefixMap: Record<string, string> = {
      SCHOOL_ADMIN: 'ADM',
      TEACHER: 'TCH',
      STUDENT: 'STU',
      PARENT: 'PAR',
    };

    const prefix = prefixMap[role];

    if (!prefix) {
      return undefined;
    }

    const users = await db.orm.public.User.all();

    const numbers = users
      .filter(
        (user) =>
          user.userCode?.startsWith(
            `${prefix}-`,
          ),
      )
      .map((user) => {
        const number = Number(
          user.userCode?.split('-')[1],
        );

        return Number.isNaN(number)
          ? 0
          : number;
      });

    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;

    return `${prefix}-${String(
      nextNumber,
    ).padStart(6, '0')}`;
  }
}