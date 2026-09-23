import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class NotificationsService {
  // GET /notifications
  getNotifications(currentUser: any) {
    return db.orm.public.Notification
      .where({ userId: currentUser.userId })
      .all();
  }

  // POST /notifications
  createNotification(dto: any, currentUser: any) {
    return db.orm.public.Notification.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type ?? 'GENERAL',
      channel: dto.channel ?? 'IN_APP',
    });
  }

  // GET /notifications/:id
  async getNotification(id: number, currentUser: any) {
    const notification = await db.orm.public.Notification
      .where({ id })
      .first();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== currentUser.userId) {
      throw new ForbiddenException('This notification is not yours');
    }

    return notification;
  }

  // PATCH /notifications/:id
  async updateNotification(id: number, dto: any, currentUser: any) {
    await this.getNotification(id, currentUser);
    await db.orm.public.Notification.where({ id }).update({ ...dto });
    return this.getNotification(id, currentUser);
  }

  // DELETE /notifications/:id
  async deleteNotification(id: number, currentUser: any) {
    await this.getNotification(id, currentUser);
    await db.orm.public.Notification.where({ id }).delete();
    return { message: 'Notification deleted successfully' };
  }

  // POST /notifications/send-email
  async sendEmail(dto: any, currentUser: any) {
    return this.createNotification(
      { ...dto, channel: 'EMAIL' },
      currentUser,
    );
  }

  // POST /notifications/send-sms
  async sendSms(dto: any, currentUser: any) {
    return this.createNotification({ ...dto, channel: 'SMS' }, currentUser);
  }

  // POST /notifications/send-push
  async sendPush(dto: any, currentUser: any) {
    return this.createNotification({ ...dto, channel: 'PUSH' }, currentUser);
  }

  // POST /notifications/announcement
  async createAnnouncement(dto: any, currentUser: any) {
    return db.orm.public.Announcement.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      creatorId: currentUser.userId,
      title: dto.title,
      message: dto.message,
      targetRole: dto.targetRole,
      isEmergency: dto.isEmergency ?? false,
      isPublished: dto.isPublished ?? true,
      publishAt: dto.publishAt,
    });
  }
}
