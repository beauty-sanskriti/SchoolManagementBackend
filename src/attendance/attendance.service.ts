import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto.js';

type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'LEAVE';

@Injectable()
export class AttendanceService {
  private getSchoolId(user: any): number {
    const schoolId = Number(user?.schoolId);

    if (!schoolId) {
      throw new ForbiddenException('School access required');
    }

    return schoolId;
  }

  private validateStatus(status: AttendanceStatus) {
    const allowed = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'];

    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Invalid attendance status. Allowed: ${allowed.join(', ')}`,
      );
    }
  }

  private async getStudent(studentId: number, schoolId: number) {
    const student = await db.orm.public.Student.where({
      id: studentId,
    }).first();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.schoolId !== schoolId) {
      throw new ForbiddenException('Student does not belong to your school');
    }

    return student;
  }

  private async validateStudent(
    studentId: number,
    classId: number,
    sectionId: number | undefined,
    schoolId: number,
  ) {
    const student = await this.getStudent(studentId, schoolId);

    if (student.classId !== classId) {
      throw new BadRequestException('Student does not belong to this class');
    }

    if (
      sectionId !== undefined &&
      student.sectionId !== sectionId
    ) {
      throw new BadRequestException(
        'Student does not belong to this section',
      );
    }
  }

  async create(dto: CreateAttendanceDto, user: any) {
    const schoolId = this.getSchoolId(user);

    this.validateStatus(dto.status);

    await this.validateStudent(
      dto.studentId,
      dto.classId,
      dto.sectionId,
      schoolId,
    );

    const existing = await db.orm.public.Attendance.where({
      studentId: dto.studentId,
      date: dto.date,
    }).first();

    if (existing) {
      throw new BadRequestException(
        'Attendance already exists for this student on this date',
      );
    }

    return db.orm.public.Attendance.create({
      studentId: dto.studentId,
      classId: dto.classId,
      sectionId: dto.sectionId,
      date: dto.date,
      status: dto.status,
      remarks: dto.remarks,
    });
  }

  async findAll(user: any) {
    const schoolId = this.getSchoolId(user);

    const students = await db.orm.public.Student.where({
      schoolId,
    }).all();

    const studentIds = new Set(students.map((student) => student.id));

    const attendance = await db.orm.public.Attendance.all();

    return attendance.filter((record) => studentIds.has(record.studentId));
  }

  async findOne(id: number, user: any) {
    const schoolId = this.getSchoolId(user);

    const attendance = await db.orm.public.Attendance.where({
      id,
    }).first();

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    await this.getStudent(attendance.studentId, schoolId);

    return attendance;
  }

  async update(id: number, dto: UpdateAttendanceDto, user: any) {
    const attendance = await this.findOne(id, user);
    const schoolId = this.getSchoolId(user);

    if (dto.status) {
      this.validateStatus(dto.status);
    }

    if (dto.studentId !== undefined || dto.classId !== undefined) {
      await this.validateStudent(
        dto.studentId ?? attendance.studentId,
        dto.classId ?? attendance.classId,
        dto.sectionId ?? attendance.sectionId ?? undefined,
        schoolId,
      );
    }

    return db.orm.public.Attendance.where({ id }).update({
      ...(dto.studentId !== undefined && { studentId: dto.studentId }),
      ...(dto.classId !== undefined && { classId: dto.classId }),
      ...(dto.sectionId !== undefined && { sectionId: dto.sectionId }),
      ...(dto.date !== undefined && { date: dto.date }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.remarks !== undefined && { remarks: dto.remarks }),
    });
  }

  async remove(id: number, user: any) {
    await this.findOne(id, user);

    return db.orm.public.Attendance.where({ id }).delete();
  }

  async bulk(dto: BulkAttendanceDto, user: any) {
    const schoolId = this.getSchoolId(user);

    if (!dto.records.length) {
      throw new BadRequestException('Attendance records are required');
    }

    const results = [];

    for (const record of dto.records) {
      this.validateStatus(record.status);

      await this.validateStudent(
        record.studentId,
        record.classId,
        record.sectionId,
        schoolId,
      );

      const existing = await db.orm.public.Attendance.where({
        studentId: record.studentId,
        date: record.date,
      }).first();

      if (existing) {
        throw new BadRequestException(
          `Attendance already exists for student ${record.studentId} on ${record.date}`,
        );
      }

      const attendance = await db.orm.public.Attendance.create({
        studentId: record.studentId,
        classId: record.classId,
        sectionId: record.sectionId,
        date: record.date,
        status: record.status,
        remarks: record.remarks,
      });

      results.push(attendance);
    }

    return results;
  }

  async report(
    user: any,
    classId?: number,
    sectionId?: number,
    date?: string,
  ) {
    const schoolId = this.getSchoolId(user);

    const students = await db.orm.public.Student.where({
      schoolId,
    }).all();

    const studentIds = new Set(
      students
        .filter(
          (student) =>
            (classId === undefined || student.classId === classId) &&
            (sectionId === undefined || student.sectionId === sectionId),
        )
        .map((student) => student.id),
    );

    const attendance = await db.orm.public.Attendance.all();

    return attendance.filter(
      (record) =>
        studentIds.has(record.studentId) &&
        (date === undefined || record.date === date),
    );
  }

  async studentAttendance(studentId: number, user: any) {
    const schoolId = this.getSchoolId(user);

    await this.getStudent(studentId, schoolId);

    return db.orm.public.Attendance.where({
      studentId,
    }).all();
  }

  async classAttendance(classId: number, user: any) {
    const schoolId = this.getSchoolId(user);

    const students = await db.orm.public.Student.where({
      schoolId,
      classId,
    }).all();

    const studentIds = new Set(students.map((student) => student.id));

    const attendance = await db.orm.public.Attendance.all();

    return attendance.filter((record) => studentIds.has(record.studentId));
  }

  // POST /attendance/qr,
  async markByDevice(
    dto: CreateAttendanceDto & { deviceId?: string; latitude?: number; longitude?: number },
    method: 'QR' | 'FACE' | 'RFID',
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);

    this.validateStatus(dto.status ?? 'PRESENT');

    await this.validateStudent(
      dto.studentId,
      dto.classId,
      dto.sectionId,
      schoolId,
    );

    const existing = await db.orm.public.Attendance.where({
      studentId: dto.studentId,
      date: dto.date,
    }).first();

    if (existing) {
      return db.orm.public.Attendance.where({ id: existing.id }).update({
        status: dto.status ?? 'PRESENT',
        method,
        deviceId: dto.deviceId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
    }

    return db.orm.public.Attendance.create({
      studentId: dto.studentId,
      classId: dto.classId,
      sectionId: dto.sectionId,
      date: dto.date,
      status: dto.status ?? 'PRESENT',
      method,
      deviceId: dto.deviceId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  // GET /attendance/analytics
  async analytics(user: any) {
    const schoolId = this.getSchoolId(user);

    const students = await db.orm.public.Student.where({ schoolId }).all();
    const studentIds = new Set(students.map((s) => s.id));

    const all = await db.orm.public.Attendance.all();
    const records = all.filter((r) => studentIds.has(r.studentId));

    const byStatus: Record<string, number> = {};

    for (const record of records) {
      byStatus[record.status] = (byStatus[record.status] ?? 0) + 1;
    }

    return {
      totalRecords: records.length,
      byStatus,
    };
  }

  // GET /attendance/alerts
  async alerts(user: any) {
    const schoolId = this.getSchoolId(user);

    const students = await db.orm.public.Student.where({ schoolId }).all();
    const studentIds = new Set(students.map((s) => s.id));

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const all = await db.orm.public.Attendance.all();
    const recent = all.filter(
      (r) =>
        studentIds.has(r.studentId) &&
        (r.status === 'ABSENT' || r.status === 'LATE') &&
        new Date(r.date) >= cutoff,
    );

    const counts: Record<number, number> = {};

    for (const record of recent) {
      counts[record.studentId] = (counts[record.studentId] ?? 0) + 1;
    }

    return Object.entries(counts)
      .filter(([, count]) => count >= 3)
      .map(([studentId, count]) => ({
        studentId: Number(studentId),
        absentOrLateCount: count,
      }));
  }
}