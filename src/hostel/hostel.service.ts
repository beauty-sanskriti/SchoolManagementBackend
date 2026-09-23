import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class HostelService {
  createHostel(dto: any, currentUser: any) {
    return db.orm.public.Hostel.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      name: dto.name,
      address: dto.address,
      description: dto.description,
    });
  }

  getHostels(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Hostel.all();
    }
    return db.orm.public.Hostel.where({ schoolId: currentUser.schoolId }).all();
  }

  async getHostel(id: number) {
    const hostel = await db.orm.public.Hostel.where({ id }).first();
    if (!hostel) {
      throw new NotFoundException('Hostel not found');
    }
    return hostel;
  }

  async updateHostel(id: number, dto: any) {
    await this.getHostel(id);
    await db.orm.public.Hostel.where({ id }).update({ ...dto });
    return this.getHostel(id);
  }

  async deleteHostel(id: number) {
    await this.getHostel(id);
    await db.orm.public.Hostel.where({ id }).delete();
    return { message: 'Hostel deleted successfully' };
  }

  async createRoom(id: number, dto: any) {
    await this.getHostel(id);
    return db.orm.public.HostelRoom.create({
      hostelId: id,
      roomNo: dto.roomNo,
      capacity: dto.capacity,
    });
  }

  async getRooms(id: number) {
    await this.getHostel(id);
    return db.orm.public.HostelRoom.where({ hostelId: id }).all();
  }

  async updateRoom(id: number, dto: any) {
    await db.orm.public.HostelRoom.where({ id }).update({ ...dto });
    return db.orm.public.HostelRoom.where({ id }).first();
  }

  async allocate(dto: any) {
    const room = await db.orm.public.HostelRoom
      .where({ id: dto.roomId })
      .first();

    if (!room) {
      throw new NotFoundException('Hostel room not found');
    }

    if (room.occupied >= room.capacity) {
      throw new BadRequestException('This room is already at full capacity');
    }

    await db.orm.public.HostelRoom
      .where({ id: room.id })
      .update({ occupied: room.occupied + 1 });

    return db.orm.public.HostelAllocation.create({
      roomId: room.id,
      studentId: dto.studentId,
      startDate: dto.startDate ?? new Date().toISOString(),
    });
  }

  getAllocations() {
    return db.orm.public.HostelAllocation.all();
  }

  async updateAllocation(id: number, dto: any) {
    const allocation = await db.orm.public.HostelAllocation
      .where({ id })
      .first();

    if (!allocation) {
      throw new NotFoundException('Hostel allocation not found');
    }

    if (dto.endDate && !allocation.endDate) {
      const room = await db.orm.public.HostelRoom
        .where({ id: allocation.roomId })
        .first();

      if (room) {
        await db.orm.public.HostelRoom
          .where({ id: room.id })
          .update({ occupied: Math.max(0, room.occupied - 1) });
      }
    }

    await db.orm.public.HostelAllocation.where({ id }).update({ ...dto });
    return db.orm.public.HostelAllocation.where({ id }).first();
  }
}
