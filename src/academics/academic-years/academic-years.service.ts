import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';

@Injectable()
export class AcademicYearsService {

  // POST /academic-years
  async createAcademicYear(
    createAcademicYearDto: CreateAcademicYearDto,
    currentUser: any,
  ) {
    const schoolId =
      createAcademicYearDto.schoolId;

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create academic years for your own school',
      );
    }

    const school =
      await db.orm.public.School
        .where({
          id: schoolId,
        })
        .first();

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    if (
      new Date(createAcademicYearDto.startDate) >=
      new Date(createAcademicYearDto.endDate)
    ) {
      throw new ConflictException(
        'Start date must be before end date',
      );
    }

    const existingAcademicYear =
      await db.orm.public.AcademicYear
        .where({
          schoolId,
          name: createAcademicYearDto.name,
        })
        .first();

    if (existingAcademicYear) {
      throw new ConflictException(
        'Academic year already exists for this school',
      );
    }

    if (
      createAcademicYearDto.isCurrent === true
    ) {
      const existingYears =
        await db.orm.public.AcademicYear
          .where({
            schoolId,
          })
          .all();

      for (const year of existingYears) {
        if (year.isCurrent) {
          await db.orm.public.AcademicYear
            .where({
              id: year.id,
            })
            .update({
              isCurrent: false,
            });
        }
      }
    }

    return db.orm.public.AcademicYear.create({
      schoolId,
      name: createAcademicYearDto.name,
      startDate:
        createAcademicYearDto.startDate,
      endDate:
        createAcademicYearDto.endDate,
      isCurrent:
        createAcademicYearDto.isCurrent ?? false,
    });
  }

  // GET /academic-years
  async getAcademicYears(
    currentUser: any,
  ) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.AcademicYear.all();
    }

    return db.orm.public.AcademicYear
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  // GET /academic-years/:id
  async getAcademicYear(
    id: number,
    currentUser: any,
  ) {
    const academicYear =
      await db.orm.public.AcademicYear
        .where({
          id,
        })
        .first();

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      academicYear.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access academic years from your own school',
      );
    }

    return academicYear;
  }

  // PATCH /academic-years/:id
  async updateAcademicYear(
    id: number,
    updateAcademicYearDto: UpdateAcademicYearDto,
    currentUser: any,
  ) {
    const existingAcademicYear =
      await db.orm.public.AcademicYear
        .where({
          id,
        })
        .first();

    if (!existingAcademicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingAcademicYear.schoolId !==
        currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update academic years from your own school',
      );
    }

    const startDate =
      updateAcademicYearDto.startDate ??
      existingAcademicYear.startDate;

    const endDate =
      updateAcademicYearDto.endDate ??
      existingAcademicYear.endDate;

    if (
      new Date(startDate) >=
      new Date(endDate)
    ) {
      throw new ConflictException(
        'Start date must be before end date',
      );
    }

    if (updateAcademicYearDto.name) {
      const existingWithSameName =
        await db.orm.public.AcademicYear
          .where({
            schoolId:
              existingAcademicYear.schoolId,
            name:
              updateAcademicYearDto.name,
          })
          .first();

      if (
        existingWithSameName &&
        existingWithSameName.id !== id
      ) {
        throw new ConflictException(
          'Academic year already exists for this school',
        );
      }
    }

    if (
      updateAcademicYearDto.isCurrent === true
    ) {
      const existingYears =
        await db.orm.public.AcademicYear
          .where({
            schoolId:
              existingAcademicYear.schoolId,
          })
          .all();

      for (const year of existingYears) {
        if (
          year.id !== id &&
          year.isCurrent
        ) {
          await db.orm.public.AcademicYear
            .where({
              id: year.id,
            })
            .update({
              isCurrent: false,
            });
        }
      }
    }

    await db.orm.public.AcademicYear
      .where({
        id,
      })
      .update({
        ...updateAcademicYearDto,
      });

    return this.getAcademicYear(
      id,
      currentUser,
    );
  }

  // DELETE /academic-years/:id
  async deleteAcademicYear(
    id: number,
    currentUser: any,
  ) {
    const existingAcademicYear =
      await db.orm.public.AcademicYear
        .where({
          id,
        })
        .first();

    if (!existingAcademicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingAcademicYear.schoolId !==
        currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete academic years from your own school',
      );
    }

    await db.orm.public.AcademicYear
      .where({
        id,
      })
      .delete();

    return {
      message:
        'Academic year deleted successfully',
    };
  }
}