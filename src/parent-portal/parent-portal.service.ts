import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class ParentPortalService {
  private async getParent(currentUser: any) {
    const parent = await db.orm.public.Parent
      .where({ userId: currentUser.userId })
      .first();

    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    return parent;
  }

  private async getChildIds(currentUser: any) {
    const parent = await this.getParent(currentUser);

    const links = await db.orm.public.ParentStudent
      .where({ parentId: parent.id })
      .all();

    return links.map((l) => l.studentId);
  }

  private async assertOwnChild(studentId: number, currentUser: any) {
    const childIds = await this.getChildIds(currentUser);

    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('This is not your child');
    }
  }

  // GET /parent/dashboard
  async dashboard(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    return { childrenCount: childIds.length, childIds };
  }

  // GET /parent/profile
  getProfile(currentUser: any) {
    return this.getParent(currentUser);
  }

  // PATCH /parent/profile
  async updateProfile(dto: any, currentUser: any) {
    const parent = await this.getParent(currentUser);
    await db.orm.public.Parent.where({ id: parent.id }).update({ ...dto });
    return this.getParent(currentUser);
  }

  // GET /parent/children
  async getChildren(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const students = await db.orm.public.Student.all();
    return students.filter((s) => childIds.includes(s.id));
  }

  // GET /parent/children/:id
  async getChild(id: number, currentUser: any) {
    await this.assertOwnChild(id, currentUser);
    return db.orm.public.Student.where({ id }).first();
  }

  // GET /parent/attendance
  async getAttendance(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const all = await db.orm.public.Attendance.all();
    return all.filter((a) => childIds.includes(a.studentId));
  }

  // GET /parent/fees
  async getFees(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const all = await db.orm.public.StudentFee.all();
    return all.filter((f) => childIds.includes(f.studentId));
  }

  // GET /parent/payments
  async getPayments(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const fees = await db.orm.public.StudentFee.all();
    const feeIds = new Set(
      fees.filter((f) => childIds.includes(f.studentId)).map((f) => f.id),
    );
    const payments = await db.orm.public.Payment.all();
    return payments.filter(
      (p) => p.studentFeeId && feeIds.has(p.studentFeeId),
    );
  }

  // GET /parent/results
  async getResults(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const all = await db.orm.public.Result.all();
    return all.filter((r) => childIds.includes(r.studentId));
  }

  // GET /parent/assignments
  async getAssignments(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const submissions = await db.orm.public.AssignmentSubmission.all();
    return submissions.filter((s) => childIds.includes(s.studentId));
  }

  // GET /parent/notifications
  async getNotifications(currentUser: any) {
    return db.orm.public.Notification
      .where({ userId: currentUser.userId })
      .all();
  }

  // GET /parent/transport
  async getTransport(currentUser: any) {
    const childIds = await this.getChildIds(currentUser);
    const all = await db.orm.public.BusAttendance.all();
    return all.filter((b) => childIds.includes(b.studentId));
  }

  // GET /parent/communication
  async getCommunication(currentUser: any) {
    const participants = await db.orm.public.ConversationParticipant
      .where({ userId: currentUser.userId })
      .all();

    const conversationIds = participants.map((p) => p.conversationId);
    const conversations = await db.orm.public.Conversation.all();

    return conversations.filter((c) => conversationIds.includes(c.id));
  }

  // POST /parent/communication
  async sendMessage(conversationId: number, message: string, currentUser: any) {
    const participant = await db.orm.public.ConversationParticipant
      .where({ conversationId, userId: currentUser.userId })
      .first();

    if (!participant) {
      throw new ForbiddenException(
        'You are not part of this conversation',
      );
    }

    return db.orm.public.Message.create({
      conversationId,
      senderId: currentUser.userId,
      message,
    });
  }
}
