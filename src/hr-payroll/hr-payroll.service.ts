import { Injectable, NotFoundException } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class HrPayrollService {
  createEmployee(dto: any, currentUser: any) {
    return db.orm.public.Employee.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      departmentId: dto.departmentId,
      employeeNo: dto.employeeNo,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      designation: dto.designation,
      salary: dto.salary,
      joiningDate: dto.joiningDate,
    });
  }

  getEmployees(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Employee.all();
    }
    return db.orm.public.Employee
      .where({ schoolId: currentUser.schoolId })
      .all();
  }

  async getEmployee(id: number) {
    const employee = await db.orm.public.Employee.where({ id }).first();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async updateEmployee(id: number, dto: any) {
    await this.getEmployee(id);
    await db.orm.public.Employee.where({ id }).update({ ...dto });
    return this.getEmployee(id);
  }

  async deleteEmployee(id: number) {
    await this.getEmployee(id);
    await db.orm.public.Employee.where({ id }).delete();
    return { message: 'Employee deleted successfully' };
  }

  async createLeave(id: number, dto: any) {
    await this.getEmployee(id);

    return db.orm.public.Leave.create({
      employeeId: id,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      status: 'PENDING',
    });
  }

  async getLeaves(id: number) {
    await this.getEmployee(id);
    return db.orm.public.Leave.where({ employeeId: id }).all();
  }

  async updateLeaveStatus(id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    await db.orm.public.Leave.where({ id }).update({ status });
    return db.orm.public.Leave.where({ id }).first();
  }

  async createPayroll(dto: any) {
    await this.getEmployee(dto.employeeId);

    const netSalary =
      dto.basicSalary + (dto.allowances ?? 0) - (dto.deductions ?? 0);

    return db.orm.public.Payroll.create({
      employeeId: dto.employeeId,
      month: dto.month,
      basicSalary: dto.basicSalary,
      allowances: dto.allowances ?? 0,
      deductions: dto.deductions ?? 0,
      netSalary,
      status: dto.status ?? 'PENDING',
    });
  }

  getPayrolls() {
    return db.orm.public.Payroll.all();
  }

  async getPayrollEntry(id: number) {
    const payroll = await db.orm.public.Payroll.where({ id }).first();
    if (!payroll) {
      throw new NotFoundException('Payroll entry not found');
    }
    return payroll;
  }

  async updatePayroll(id: number, dto: any) {
    await this.getPayrollEntry(id);
    await db.orm.public.Payroll.where({ id }).update({ ...dto });
    return this.getPayrollEntry(id);
  }

  async getSalarySlip(id: number) {
    const payroll = await this.getPayrollEntry(id);
    const employee = await this.getEmployee(payroll.employeeId);

    return { payroll, employee };
  }
}
