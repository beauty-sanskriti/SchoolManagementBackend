import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';
import { InvitesService } from '../invites/invites.service.js';
import { VerificationService } from '../auth/verification/verification.service.js';

@Injectable()
export class ParentsService {
  constructor(
    private readonly invitesService: InvitesService,
    private readonly verificationService: VerificationService,
  ) {}

  private checkAccess(parent: any, currentUser: any) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      parent.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access parents from your own school',
      );
    }
  }

  // POST /parents
  createParent(dto: any) {
    return db.orm.public.Parent.create({ ...dto });
  }

  // GET /parents
  getParents(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Parent.all();
    }
    return db.orm.public.Parent.where({ schoolId: currentUser.schoolId }).all();
  }

  // GET /parents/:id
  async getParent(id: number, currentUser: any) {
    const parent = await db.orm.public.Parent.where({ id }).first();

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    this.checkAccess(parent, currentUser);
    return parent;
  }

  // PATCH /parents/:id
  async updateParent(id: number, dto: any, currentUser: any) {
    await this.getParent(id, currentUser);
    await db.orm.public.Parent.where({ id }).update({ ...dto });
    return this.getParent(id, currentUser);
  }

  // DELETE /parents/:id
  async deleteParent(id: number, currentUser: any) {
    await this.getParent(id, currentUser);
    await db.orm.public.Parent.where({ id }).delete();
    return { message: 'Parent deleted successfully' };
  }

  // POST /parents/invite
  inviteParent(schoolId: number, email: string, currentUser: any) {
    return this.invitesService.createInvite(
      { schoolId, email, type: 'PARENT' },
      currentUser,
    );
  }

  // POST /parents/verify
  verifyParent(email: string, otp: string) {
    return this.verificationService.verifyOtp(email, otp, 'EMAIL');
  }

  // POST /parents/link-student
  async linkStudent(
    parentUserId: number,
    studentId: number,
    relation: string,
    currentUser: any,
  ) {
    const parent = await db.orm.public.Parent
      .where({ userId: parentUserId })
      .first();

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    this.checkAccess(parent, currentUser);

    const student = await db.orm.public.Student
      .where({ id: studentId })
      .first();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const existing = await db.orm.public.ParentStudent
      .where({ parentId: parent.id, studentId })
      .first();

    if (existing) {
      throw new ConflictException(
        'This student is already linked to this parent',
      );
    }

    return db.orm.public.ParentStudent.create({
      parentId: parent.id,
      studentId,
      relation,
    });
  }
}
