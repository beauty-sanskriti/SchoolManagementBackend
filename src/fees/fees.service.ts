import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto.js';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto.js';
import { CreateStudentFeeDto } from './dto/create-student-fee.dto.js';
import { UpdateStudentFeeDto } from './dto/update-student-fee.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';

@Injectable()
export class FeesService {
  private getSchoolId(user: any): number {
    const schoolId = Number(user?.schoolId);

    if (!schoolId) {
      throw new ForbiddenException('School access required');
    }

    return schoolId;
  }

  private async getStudent(
    studentId: number,
    schoolId: number,
  ) {
    const student =
      await db.orm.public.Student
        .where({
          id: studentId,
        })
        .first();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.schoolId !== schoolId) {
      throw new ForbiddenException(
        'Student does not belong to your school',
      );
    }

    return student;
  }

  private async getFeeStructure(
    id: number,
    schoolId: number,
  ) {
    const feeStructure =
      await db.orm.public.FeeStructure
        .where({
          id,
        })
        .first();

    if (!feeStructure) {
      throw new NotFoundException(
        'Fee structure not found',
      );
    }

    if (feeStructure.schoolId !== schoolId) {
      throw new ForbiddenException(
        'Fee structure does not belong to your school',
      );
    }

    return feeStructure;
  }

  private async getStudentFee(
    id: number,
    schoolId: number,
  ) {
    const studentFee =
      await db.orm.public.StudentFee
        .where({
          id,
        })
        .first();

    if (!studentFee) {
      throw new NotFoundException(
        'Student fee not found',
      );
    }

    await this.getStudent(
      studentFee.studentId,
      schoolId,
    );

    await this.getFeeStructure(
      studentFee.feeStructureId,
      schoolId,
    );

    return studentFee;
  }

  private async getPayment(
    id: number,
    schoolId: number,
  ) {
    const payment =
      await db.orm.public.Payment
        .where({
          id,
        })
        .first();

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    if (payment.studentFeeId) {
      await this.getStudentFee(
        payment.studentFeeId,
        schoolId,
      );
    }

    return payment;
  }

  async createFeeStructure(
    dto: CreateFeeStructureDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    if (dto.schoolId !== schoolId) {
      throw new ForbiddenException(
        'You can only create fee structures for your school',
      );
    }

    return db.orm.public.FeeStructure.create({
      schoolId,
      name: dto.name,
      amount: dto.amount,
      description: dto.description,
      frequency: dto.frequency,
    });
  }

  async findAllFeeStructures(user: any) {
    const schoolId = this.getSchoolId(user);

    return db.orm.public.FeeStructure
      .where({
        schoolId,
      })
      .all();
  }

  async findOneFeeStructure(
    id: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    return this.getFeeStructure(
      id,
      schoolId,
    );
  }

  async updateFeeStructure(
    id: number,
    dto: UpdateFeeStructureDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    await this.getFeeStructure(
      id,
      schoolId,
    );

    return db.orm.public.FeeStructure
      .where({
        id,
      })
      .update({
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.amount !== undefined && {
          amount: dto.amount,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.frequency !== undefined && {
          frequency: dto.frequency,
        }),
      });
  }

  async removeFeeStructure(
    id: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    await this.getFeeStructure(
      id,
      schoolId,
    );

    const studentFees =
      await db.orm.public.StudentFee
        .where({
          feeStructureId: id,
        })
        .all();

    if (studentFees.length) {
      throw new BadRequestException(
        'Fee structure cannot be deleted because student fees exist',
      );
    }

    return db.orm.public.FeeStructure
      .where({
        id,
      })
      .delete();
  }

  async createStudentFee(
    dto: CreateStudentFeeDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    await this.getStudent(
      dto.studentId,
      schoolId,
    );

    await this.getFeeStructure(
      dto.feeStructureId,
      schoolId,
    );

    const paidAmount =
      dto.paidAmount ?? 0;

    if (paidAmount > dto.amount) {
      throw new BadRequestException(
        'Paid amount cannot be greater than fee amount',
      );
    }

    let status:
      | 'PENDING'
      | 'PARTIAL'
      | 'PAID' = 'PENDING';

    if (paidAmount === dto.amount) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }

    return db.orm.public.StudentFee.create({
      studentId: dto.studentId,
      feeStructureId: dto.feeStructureId,
      amount: dto.amount,
      paidAmount,
      dueDate: dto.dueDate,
      status,
    });
  }

  async findAllStudentFees(user: any) {
    const schoolId = this.getSchoolId(user);

    const students =
      await db.orm.public.Student
        .where({
          schoolId,
        })
        .all();

    const studentIds = new Set(
      students.map(
        (student) => student.id,
      ),
    );

    const studentFees =
      await db.orm.public.StudentFee
        .all();

    return studentFees.filter(
      (fee) =>
        studentIds.has(fee.studentId),
    );
  }

  async findOneStudentFee(
    id: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    return this.getStudentFee(
      id,
      schoolId,
    );
  }

  async updateStudentFee(
    id: number,
    dto: UpdateStudentFeeDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    const studentFee =
      await this.getStudentFee(
        id,
        schoolId,
      );

    const amount =
      dto.amount ?? studentFee.amount;

    const paidAmount =
      dto.paidAmount ??
      studentFee.paidAmount;

    if (paidAmount > amount) {
      throw new BadRequestException(
        'Paid amount cannot be greater than fee amount',
      );
    }

    let status:
      | 'PENDING'
      | 'PARTIAL'
      | 'PAID' = 'PENDING';

    if (paidAmount === amount) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }

    return db.orm.public.StudentFee
      .where({
        id,
      })
      .update({
        ...(dto.amount !== undefined && {
          amount,
        }),
        ...(dto.paidAmount !== undefined && {
          paidAmount,
        }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate,
        }),
        status,
      });
  }

  async createPayment(
    dto: CreatePaymentDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    if (dto.studentFeeId) {
      const studentFee =
        await this.getStudentFee(
          dto.studentFeeId,
          schoolId,
        );

      const outstanding =
        studentFee.amount -
        studentFee.paidAmount;

      if (dto.amount > outstanding) {
        throw new BadRequestException(
          'Payment amount cannot be greater than outstanding fee',
        );
      }

      if (dto.amount <= 0) {
        throw new BadRequestException(
          'Payment amount must be greater than zero',
        );
      }
    }

    if (dto.transactionId) {
      const existing =
        await db.orm.public.Payment
          .where({
            transactionId:
              dto.transactionId,
          })
          .first();

      if (existing) {
        throw new BadRequestException(
          'Transaction ID already exists',
        );
      }
    }

    const payment =
      await db.orm.public.Payment.create({
        studentFeeId:
          dto.studentFeeId,
        amount: dto.amount,
        transactionId:
          dto.transactionId,
        status: dto.transactionId
          ? 'SUCCESS'
          : 'PENDING',
      });

    if (
      dto.studentFeeId &&
      dto.transactionId
    ) {
      const studentFee =
        await this.getStudentFee(
          dto.studentFeeId,
          schoolId,
        );

      const paidAmount =
        studentFee.paidAmount +
        dto.amount;

      let status:
        | 'PENDING'
        | 'PARTIAL'
        | 'PAID' = 'PENDING';

      if (
        paidAmount ===
        studentFee.amount
      ) {
        status = 'PAID';
      } else if (paidAmount > 0) {
        status = 'PARTIAL';
      }

      await db.orm.public.StudentFee
        .where({
          id: dto.studentFeeId,
        })
        .update({
          paidAmount,
          status,
        });
    }

    return payment;
  }

  async findAllPayments(user: any) {
    const schoolId = this.getSchoolId(user);

    const studentFees =
      await this.findAllStudentFees(
        user,
      );

    const studentFeeIds = new Set(
      studentFees.map(
        (fee) => fee.id,
      ),
    );

    const payments =
      await db.orm.public.Payment
        .all();

    return payments.filter(
      (payment) =>
        !payment.studentFeeId ||
        studentFeeIds.has(
          payment.studentFeeId,
        ),
    );
  }

  async findOnePayment(
    id: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    return this.getPayment(
      id,
      schoolId,
    );
  }

  async updatePayment(
    id: number,
    dto: UpdatePaymentDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    await this.getPayment(
      id,
      schoolId,
    );

    return db.orm.public.Payment
      .where({
        id,
      })
      .update({
        ...(dto.transactionId !==
          undefined && {
          transactionId:
            dto.transactionId,
        }),
        ...(dto.status !== undefined && {
          status: dto.status as any,
        }),
        ...(dto.paymentMethod !==
          undefined && {
          paymentMethod:
            dto.paymentMethod,
        }),
        ...(dto.receiptUrl !==
          undefined && {
          receiptUrl:
            dto.receiptUrl,
        }),
      });
  }

  async getReceipt(
    id: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    const payment =
      await this.getPayment(
        id,
        schoolId,
      );

    let studentFee = null;
    let student = null;
    let feeStructure = null;

    if (payment.studentFeeId) {
      studentFee =
        await this.getStudentFee(
          payment.studentFeeId,
          schoolId,
        );

      student =
        await this.getStudent(
          studentFee.studentId,
          schoolId,
        );

      feeStructure =
        await this.getFeeStructure(
          studentFee.feeStructureId,
          schoolId,
        );
    }

    return {
      receipt: {
        paymentId: payment.id,
        transactionId:
          payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod:
          (payment as any).paymentMethod,
        paidAt: payment.createdAt,
      },
      student: student
        ? {
            id: student.id,
            admissionNo:
              student.admissionNo,
          }
        : null,
      fee: studentFee
        ? {
            id: studentFee.id,
            amount:
              studentFee.amount,
            paidAmount:
              studentFee.paidAmount,
            dueDate:
              studentFee.dueDate,
            status:
              studentFee.status,
          }
        : null,
      feeStructure: feeStructure
        ? {
            id: feeStructure.id,
            name: feeStructure.name,
            frequency:
              feeStructure.frequency,
          }
        : null,
    };
  }

  async createOrder(
    dto: CreateOrderDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    const studentFee =
      await this.getStudentFee(
        dto.studentFeeId,
        schoolId,
      );

    const outstanding =
      studentFee.amount -
      studentFee.paidAmount;

    if (dto.amount > outstanding) {
      throw new BadRequestException(
        'Order amount cannot be greater than outstanding fee',
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException(
        'Order amount must be greater than zero',
      );
    }

    return {
      message:
        'Payment order created successfully',
      order: {
        orderId: `ORDER_${Date.now()}_${studentFee.id}`,
        studentFeeId:
          studentFee.id,
        amount: dto.amount,
        currency: 'INR',
        status: 'CREATED',
      },
    };
  }

  async verifyPayment(
    dto: VerifyPaymentDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    const payment =
      await this.getPayment(
        dto.paymentId,
        schoolId,
      );

    if (
      dto.signature &&
      !dto.transactionId
    ) {
      throw new BadRequestException(
        'Transaction ID is required',
      );
    }

    const updatedPayment =
      await db.orm.public.Payment
        .where({
          id: payment.id,
        })
        .update({
          transactionId:
            dto.transactionId,
          status: 'SUCCESS',
        });

    if (payment.studentFeeId) {
      const studentFee =
        await this.getStudentFee(
          payment.studentFeeId,
          schoolId,
        );

      const paidAmount =
        studentFee.paidAmount +
        payment.amount;

      let status:
        | 'PENDING'
        | 'PARTIAL'
        | 'PAID' = 'PENDING';

      if (
        paidAmount >=
        studentFee.amount
      ) {
        status = 'PAID';
      } else if (paidAmount > 0) {
        status = 'PARTIAL';
      }

      await db.orm.public.StudentFee
        .where({
          id: studentFee.id,
        })
        .update({
          paidAmount,
          status,
        });
    }

    return {
      message:
        'Payment verified successfully',
      payment: updatedPayment,
    };
  }

  // POST /payments/refund
  async refundPayment(
    paymentId: number,
    amount: number | undefined,
    currentUser: any,
  ) {
    const payment = await db.orm.public.Payment
      .where({ id: paymentId })
      .first();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'SUCCESS') {
      throw new BadRequestException(
        'Only successful payments can be refunded',
      );
    }

    const refundAmount = amount ?? payment.amount;

    await db.orm.public.Payment
      .where({ id: paymentId })
      .update({ status: 'REFUNDED' });

    if (payment.studentFeeId) {
      const studentFee = await db.orm.public.StudentFee
        .where({ id: payment.studentFeeId })
        .first();

      if (studentFee) {
        const paidAmount = Math.max(
          0,
          studentFee.paidAmount - refundAmount,
        );

        await db.orm.public.StudentFee
          .where({ id: studentFee.id })
          .update({
            paidAmount,
            status: paidAmount === 0 ? 'PENDING' : 'PARTIAL',
          });
      }
    }

    return {
      message: 'Payment refunded successfully',
      refundAmount,
    };
  }

  // GET /payments/analytics
  async paymentsAnalytics(currentUser: any) {
    const payments = await db.orm.public.Payment.all();

    const totalCollected = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = payments
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + p.amount, 0);

    const byStatus: Record<string, number> = {};

    for (const payment of payments) {
      byStatus[payment.status] = (byStatus[payment.status] ?? 0) + 1;
    }

    return {
      totalPayments: payments.length,
      totalCollected,
      totalRefunded,
      byStatus,
    };
  }
}