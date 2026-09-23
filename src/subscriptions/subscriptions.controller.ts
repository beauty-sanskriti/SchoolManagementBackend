import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post('subscription-plans')
  createPlan(@Body() dto: any) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Get('subscription-plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('subscription-plans/:id')
  getPlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.getPlan(id);
  }

  @Patch('subscription-plans/:id')
  updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @Delete('subscription-plans/:id')
  deletePlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.deletePlan(id);
  }

  @Post('subscriptions')
  createSubscription(@Body() dto: any) {
    return this.subscriptionsService.createSubscription(dto);
  }

  @Get('subscriptions')
  getSubscriptions(@Request() req: any) {
    return this.subscriptionsService.getSubscriptions(req.user);
  }

  @Get('subscriptions/:id')
  getSubscription(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.getSubscription(id);
  }

  @Patch('subscriptions/:id')
  updateSubscription(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.subscriptionsService.updateSubscription(id, dto);
  }

  @Delete('subscriptions/:id')
  deleteSubscription(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.deleteSubscription(id);
  }

  @Post('subscriptions/:id/upgrade')
  upgrade(
    @Param('id', ParseIntPipe) id: number,
    @Body('planId', ParseIntPipe) planId: number,
  ) {
    return this.subscriptionsService.upgrade(id, planId);
  }

  @Post('subscriptions/:id/downgrade')
  downgrade(
    @Param('id', ParseIntPipe) id: number,
    @Body('planId', ParseIntPipe) planId: number,
  ) {
    return this.subscriptionsService.downgrade(id, planId);
  }

  @Post('subscriptions/:id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.cancel(id);
  }

  @Post('subscription-payments')
  createPayment(@Body() dto: any) {
    return this.subscriptionsService.createPayment(dto);
  }

  @Get('subscription-payments')
  getPayments() {
    return this.subscriptionsService.getPayments();
  }

  @Get('subscription-payments/:id')
  getPayment(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.getPayment(id);
  }
}
