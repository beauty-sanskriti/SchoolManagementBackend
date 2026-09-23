import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

import { CreateCampusDto } from './dto/create-campus.dto.js';
import { UpdateCampusDto } from './dto/update-campus.dto.js';

@Injectable()
export class CampusesService {

  // POST /campuses
  async createCampus(
    createCampusDto: CreateCampusDto,
    currentUser: any,
  ) {
    const schoolId =
      createCampusDto.schoolId;

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create campuses for your own school',
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

    const existingCampus =
      await db.orm.public.Campus
        .where({
          schoolId,
          code: createCampusDto.code,
        })
        .first();

    if (existingCampus) {
      throw new ConflictException(
        'Campus code already exists for this school',
      );
    }

    return db.orm.public.Campus.create({
      schoolId,
      name: createCampusDto.name,
      code: createCampusDto.code,
      address: createCampusDto.address,
      city: createCampusDto.city,
      state: createCampusDto.state,
      country: createCampusDto.country,
    });
  }

  // GET /campuses
  async getCampuses(
    currentUser: any,
  ) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Campus.all();
    }

    return db.orm.public.Campus
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  // GET /campuses/:id
  async getCampus(
    id: number,
    currentUser: any,
  ) {
    const campus =
      await db.orm.public.Campus
        .where({
          id,
        })
        .first();

    if (!campus) {
      throw new NotFoundException(
        'Campus not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      campus.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access campuses from your own school',
      );
    }

    return campus;
  }

  // PATCH /campuses/:id
  async updateCampus(
    id: number,
    updateCampusDto: UpdateCampusDto,
    currentUser: any,
  ) {
    const existingCampus =
      await db.orm.public.Campus
        .where({
          id,
        })
        .first();

    if (!existingCampus) {
      throw new NotFoundException(
        'Campus not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingCampus.schoolId !==
        currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update campuses from your own school',
      );
    }

    if (updateCampusDto.code) {
      const existingWithSameCode =
        await db.orm.public.Campus
          .where({
            schoolId:
              existingCampus.schoolId,
            code: updateCampusDto.code,
          })
          .first();

      if (
        existingWithSameCode &&
        existingWithSameCode.id !== id
      ) {
        throw new ConflictException(
          'Campus code already exists for this school',
        );
      }
    }

    await db.orm.public.Campus
      .where({
        id,
      })
      .update(updateCampusDto);

    return this.getCampus(
      id,
      currentUser,
    );
  }

  // DELETE /campuses/:id
  async deleteCampus(
    id: number,
    currentUser: any,
  ) {
    const existingCampus =
      await db.orm.public.Campus
        .where({
          id,
        })
        .first();

    if (!existingCampus) {
      throw new NotFoundException(
        'Campus not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingCampus.schoolId !==
        currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete campuses from your own school',
      );
    }

    await db.orm.public.Campus
      .where({
        id,
      })
      .delete();

    return {
      message:
        'Campus deleted successfully',
    };
  }
}
