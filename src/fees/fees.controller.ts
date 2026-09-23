import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import { FeesService } from './fees.service.js';

import { CreateFeeStructureDto } from './dto/create-fee-structure.dto.js';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto.js';
import { CreateStudentFeeDto } from './dto/create-student-fee.dto.js';
import { UpdateStudentFeeDto } from './dto/update-student-fee.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class FeesController {
  constructor(
    private readonly feesService: FeesService,
  ) {}

  @Post('fee-structures')
  createFeeStructure(
    @Body() dto: CreateFeeStructureDto,
    @Req() req: any,
  ) {
    return this.feesService.createFeeStructure(
      dto,
      req.user,
    );
  }

  @Get('fee-structures')
  findAllFeeStructures(
    @Req() req: any,
  ) {
    return this.feesService.findAllFeeStructures(
      req.user,
    );
  }

  @Get('fee-structures/:id')
  findOneFeeStructure(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.feesService.findOneFeeStructure(
      id,
      req.user,
    );
  }

  @Patch('fee-structures/:id')
  updateFeeStructure(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeStructureDto,
    @Req() req: any,
  ) {
    return this.feesService.updateFeeStructure(
      id,
      dto,
      req.user,
    );
  }

  @Delete('fee-structures/:id')
  removeFeeStructure(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.feesService.removeFeeStructure(
      id,
      req.user,
    );
  }

  @Post('student-fees')
  createStudentFee(
    @Body() dto: CreateStudentFeeDto,
    @Req() req: any,
  ) {
    return this.feesService.createStudentFee(
      dto,
      req.user,
    );
  }

  @Get('student-fees')
  findAllStudentFees(
    @Req() req: any,
  ) {
    return this.feesService.findAllStudentFees(
      req.user,
    );
  }

  @Get('student-fees/:id')
  findOneStudentFee(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.feesService.findOneStudentFee(
      id,
      req.user,
    );
  }

  @Patch('student-fees/:id')
  updateStudentFee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentFeeDto,
    @Req() req: any,
  ) {
    return this.feesService.updateStudentFee(
      id,
      dto,
      req.user,
    );
  }

  @Post('payments')
  createPayment(
    @Body() dto: CreatePaymentDto,
    @Req() req: any,
  ) {
    return this.feesService.createPayment(
      dto,
      req.user,
    );
  }

  @Get('payments')
  findAllPayments(
    @Req() req: any,
  ) {
    return this.feesService.findAllPayments(
      req.user,
    );
  }

  // GET /payments/analytics
  @Get('payments/analytics')
  paymentsAnalytics(@Req() req: any) {
    return this.feesService.paymentsAnalytics(req.user);
  }

  @Get('payments/:id/receipt')
  getReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.feesService.getReceipt(
      id,
      req.user,
    );
  }

  @Get('payments/:id')
  findOnePayment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.feesService.findOnePayment(
      id,
      req.user,
    );
  }

  @Patch('payments/:id')
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
    @Req() req: any,
  ) {
    return this.feesService.updatePayment(
      id,
      dto,
      req.user,
    );
  }

  @Post('payments/create-order')
  createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: any,
  ) {
    return this.feesService.createOrder(
      dto,
      req.user,
    );
  }

  @Post('payments/verify')
  verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @Req() req: any,
  ) {
    return this.feesService.verifyPayment(
      dto,
      req.user,
    );
  }

  // POST /payments/refund
  @Post('payments/refund')
  refundPayment(
    @Body('paymentId', ParseIntPipe) paymentId: number,
    @Body('amount') amount: number | undefined,
    @Req() req: any,
  ) {
    return this.feesService.refundPayment(paymentId, amount, req.user);
  }
}