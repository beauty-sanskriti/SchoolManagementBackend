import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class CommunicationService {
  private async assertParticipant(conversationId: number, currentUser: any) {
    const participant = await db.orm.public.ConversationParticipant
      .where({ conversationId, userId: currentUser.userId })
      .first();

    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation');
    }
  }

  // POST /conversations
  async createConversation(dto: any, currentUser: any) {
    const conversation = await db.orm.public.Conversation.create({
      schoolId: currentUser.schoolId,
      title: dto.title,
      type: dto.type ?? 'DIRECT',
    });

    const participantIds: number[] = [
      currentUser.userId,
      ...(dto.participantIds ?? []),
    ];

    for (const userId of [...new Set(participantIds)]) {
      await db.orm.public.ConversationParticipant.create({
        conversationId: conversation.id,
        userId,
      });
    }

    return conversation;
  }

  // GET /conversations
  async getConversations(currentUser: any) {
    const participants = await db.orm.public.ConversationParticipant
      .where({ userId: currentUser.userId })
      .all();

    const conversationIds = participants.map((p) => p.conversationId);
    const conversations = await db.orm.public.Conversation.all();

    return conversations.filter((c) => conversationIds.includes(c.id));
  }

  // GET /conversations/:id
  async getConversation(id: number, currentUser: any) {
    await this.assertParticipant(id, currentUser);

    const conversation = await db.orm.public.Conversation
      .where({ id })
      .first();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  // DELETE /conversations/:id
  async deleteConversation(id: number, currentUser: any) {
    await this.assertParticipant(id, currentUser);
    await db.orm.public.Conversation.where({ id }).delete();
    return { message: 'Conversation deleted successfully' };
  }

  // GET /conversations/:id/messages
  async getMessages(id: number, currentUser: any) {
    await this.assertParticipant(id, currentUser);
    return db.orm.public.Message.where({ conversationId: id }).all();
  }

  // POST /conversations/:id/messages
  async sendMessage(id: number, dto: any, currentUser: any) {
    await this.assertParticipant(id, currentUser);

    return db.orm.public.Message.create({
      conversationId: id,
      senderId: currentUser.userId,
      message: dto.message,
      attachmentUrl: dto.attachmentUrl,
      messageType: dto.messageType ?? 'TEXT',
    });
  }

  // PATCH /messages/:id
  async updateMessage(id: number, dto: any, currentUser: any) {
    const message = await db.orm.public.Message.where({ id }).first();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== currentUser.userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    await db.orm.public.Message.where({ id }).update({
      message: dto.message,
    });

    return db.orm.public.Message.where({ id }).first();
  }

  // DELETE /messages/:id
  async deleteMessage(id: number, currentUser: any) {
    const message = await db.orm.public.Message.where({ id }).first();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== currentUser.userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await db.orm.public.Message.where({ id }).delete();
    return { message: 'Message deleted successfully' };
  }
}
