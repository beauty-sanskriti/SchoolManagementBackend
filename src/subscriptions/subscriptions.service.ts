import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class SubscriptionsService {
  createPlan(dto: any) {
    return db.orm.public.SubscriptionPlan.create({
      name: dto.name,
      description: dto.description,
      amount: dto.amount,
      billingCycle: dto.billingCycle,
      maxStudents: dto.maxStudents,
      maxTeachers: dto.maxTeachers,
      features: dto.features,
      isActive: dto.isActive ?? true,
    });
  }

  getPlans() {
    return db.orm.public.SubscriptionPlan.all();
  }

  async getPlan(id: number) {
    const plan = await db.orm.public.SubscriptionPlan.where({ id }).first();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async updatePlan(id: number, dto: any) {
    await this.getPlan(id);
    await db.orm.public.SubscriptionPlan.where({ id }).update({ ...dto });
    return this.getPlan(id);
  }

  async deletePlan(id: number) {
    await this.getPlan(id);
    await db.orm.public.SubscriptionPlan.where({ id }).delete();
    return { message: 'Subscription plan deleted successfully' };
  }

  async createSubscription(dto: any) {
    const plan = dto.planId ? await this.getPlan(dto.planId) : null;

    return db.orm.public.Subscription.create({
      schoolId: dto.schoolId,
      planId: dto.planId,
      planName: dto.planName ?? plan?.name ?? 'Custom',
      amount: dto.amount ?? plan?.amount ?? 0,
      startDate: dto.startDate ?? new Date().toISOString(),
      endDate: dto.endDate,
      status: 'ACTIVE',
    });
  }

  getSubscriptions(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Subscription.all();
    }
    return db.orm.public.Subscription
      .where({ schoolId: currentUser.schoolId })
      .all();
  }

  async getSubscription(id: number) {
    const subscription = await db.orm.public.Subscription
      .where({ id })
      .first();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async updateSubscription(id: number, dto: any) {
    await this.getSubscription(id);
    await db.orm.public.Subscription.where({ id }).update({ ...dto });
    return this.getSubscription(id);
  }

  async deleteSubscription(id: number) {
    await this.getSubscription(id);
    await db.orm.public.Subscription.where({ id }).delete();
    return { message: 'Subscription deleted successfully' };
  }

  async upgrade(id: number, planId: number) {
    const plan = await this.getPlan(planId);
    await db.orm.public.Subscription.where({ id }).update({
      planId,
      planName: plan.name,
      amount: plan.amount,
    });
    return this.getSubscription(id);
  }

  async downgrade(id: number, planId: number) {
    return this.upgrade(id, planId);
  }

  async cancel(id: number) {
    await this.getSubscription(id);
    await db.orm.public.Subscription.where({ id }).update({
      status: 'CANCELLED',
    });
    return this.getSubscription(id);
  }

  createPayment(dto: any) {
    if (!dto.subscriptionId) {
      throw new BadRequestException('subscriptionId is required');
    }

    return db.orm.public.SubscriptionPayment.create({
      subscriptionId: dto.subscriptionId,
      amount: dto.amount,
      transactionId: dto.transactionId,
      status: dto.status ?? 'PENDING',
    });
  }

  getPayments() {
    return db.orm.public.SubscriptionPayment.all();
  }

  async getPayment(id: number) {
    const payment = await db.orm.public.SubscriptionPayment
      .where({ id })
      .first();

    if (!payment) {
      throw new NotFoundException('Subscription payment not found');
    }

    return payment;
  }
}
