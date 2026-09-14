import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

import { CreateAdmissionDto } from './dto/create-admission.dto.js';
import { UpdateAdmissionDto } from './dto/update-admission.dto.js';

@Injectable()
export class AdmissionsService {
  async createAdmission(
    dto: CreateAdmissionDto,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      dto.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create admissions for your own school',
      );
    }

    const school = await db.orm.public.School
      .where({ id: dto.schoolId })
      .first();

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (dto.studentId) {
      const student = await db.orm.public.Student
        .where({ id: dto.studentId })
        .first();

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      if (student.schoolId !== dto.schoolId) {
        throw new ForbiddenException(
          'Student does not belong to this school',
        );
      }
    }

    if (dto.classId) {
      const classRecord = await db.orm.public.Class
        .where({ id: dto.classId })
        .first();

      if (!classRecord) {
        throw new NotFoundException('Class not found');
      }

      if (classRecord.schoolId !== dto.schoolId) {
        throw new ForbiddenException(
          'Class does not belong to this school',
        );
      }
    }

    const existing = await db.orm.public.Admission
      .where({
        applicationNo: dto.applicationNo,
      })
      .first();

    if (existing) {
      throw new ConflictException(
        'Application number already exists',
      );
    }

    return db.orm.public.Admission.create({
      schoolId: dto.schoolId,
      studentId: dto.studentId,
      applicationNo: dto.applicationNo,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      classId: dto.classId,
      notes: dto.notes,
    });
  }

  async getAdmissions(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Admission.all();
    }

    return db.orm.public.Admission
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getAdmission(
    id: number,
    currentUser: any,
  ) {
    const admission = await db.orm.public.Admission
      .where({ id })
      .first();

    if (!admission) {
      throw new NotFoundException(
        'Admission not found',
      );
    }

    this.checkAccess(admission, currentUser);

    return admission;
  }

  async updateAdmission(
    id: number,
    dto: UpdateAdmissionDto,
    currentUser: any,
  ) {
    const admission = await db.orm.public.Admission
      .where({ id })
      .first();

    if (!admission) {
      throw new NotFoundException(
        'Admission not found',
      );
    }

    this.checkAccess(admission, currentUser);

    if (dto.studentId) {
      const student = await db.orm.public.Student
        .where({ id: dto.studentId })
        .first();

      if (!student) {
        throw new NotFoundException(
          'Student not found',
        );
      }

      if (student.schoolId !== admission.schoolId) {
        throw new ForbiddenException(
          'Student does not belong to this school',
        );
      }
    }

    if (dto.classId) {
      const classRecord = await db.orm.public.Class
        .where({ id: dto.classId })
        .first();

      if (!classRecord) {
        throw new NotFoundException(
          'Class not found',
        );
      }

      if (
        classRecord.schoolId !== admission.schoolId
      ) {
        throw new ForbiddenException(
          'Class does not belong to this school',
        );
      }
    }

    if (dto.applicationNo) {
      const existing = await db.orm.public.Admission
        .where({
          applicationNo: dto.applicationNo,
        })
        .first();

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Application number already exists',
        );
      }
    }

    await db.orm.public.Admission
      .where({ id })
      .update(dto);

    return this.getAdmission(
      id,
      currentUser,
    );
  }

  async updateStatus(
    id: number,
    status: string,
    currentUser: any,
  ) {
    const admission = await db.orm.public.Admission
      .where({ id })
      .first();

    if (!admission) {
      throw new NotFoundException(
        'Admission not found',
      );
    }

    this.checkAccess(admission, currentUser);

    const validStatuses = [
      'APPLIED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
    ] as const;

    if (
      !validStatuses.includes(
        status as typeof validStatuses[number],
      )
    ) {
      throw new ConflictException(
        'Invalid admission status',
      );
    }

    await db.orm.public.Admission
      .where({ id })
      .update({
        status:
          status as typeof validStatuses[number],
      });

    return this.getAdmission(
      id,
      currentUser,
    );
  }

  private checkAccess(
    admission: any,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      admission.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access admissions from your own school',
      );
    }
  }
}