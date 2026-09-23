import { Injectable, NotFoundException } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class TransportService {
  createBus(dto: any, currentUser: any) {
    return db.orm.public.Bus.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      number: dto.number,
      registrationNo: dto.registrationNo,
      capacity: dto.capacity,
      driverId: dto.driverId,
    });
  }

  getBuses(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Bus.all();
    }
    return db.orm.public.Bus.where({ schoolId: currentUser.schoolId }).all();
  }

  async getBus(id: number) {
    const bus = await db.orm.public.Bus.where({ id }).first();
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    return bus;
  }

  async updateBus(id: number, dto: any) {
    await this.getBus(id);
    await db.orm.public.Bus.where({ id }).update({ ...dto });
    return this.getBus(id);
  }

  async deleteBus(id: number) {
    await this.getBus(id);
    await db.orm.public.Bus.where({ id }).delete();
    return { message: 'Bus deleted successfully' };
  }

  createDriver(dto: any, currentUser: any) {
    return db.orm.public.Driver.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      name: dto.name,
      phone: dto.phone,
      licenseNo: dto.licenseNo,
    });
  }

  getDrivers(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Driver.all();
    }
    return db.orm.public.Driver.where({ schoolId: currentUser.schoolId }).all();
  }

  async updateDriver(id: number, dto: any) {
    await db.orm.public.Driver.where({ id }).update({ ...dto });
    return db.orm.public.Driver.where({ id }).first();
  }

  async deleteDriver(id: number) {
    await db.orm.public.Driver.where({ id }).delete();
    return { message: 'Driver deleted successfully' };
  }

  createRoute(dto: any, currentUser: any) {
    return db.orm.public.TransportRoute.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      name: dto.name,
      startPoint: dto.startPoint,
      endPoint: dto.endPoint,
      stops: dto.stops,
    });
  }

  getRoutes(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.TransportRoute.all();
    }
    return db.orm.public.TransportRoute
      .where({ schoolId: currentUser.schoolId })
      .all();
  }

  async updateRoute(id: number, dto: any) {
    await db.orm.public.TransportRoute.where({ id }).update({ ...dto });
    return db.orm.public.TransportRoute.where({ id }).first();
  }

  async deleteRoute(id: number) {
    await db.orm.public.TransportRoute.where({ id }).delete();
    return { message: 'Route deleted successfully' };
  }

  async recordLocation(dto: any) {
    await this.getBus(dto.busId);

    return db.orm.public.BusLocation.create({
      busId: dto.busId,
      routeId: dto.routeId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      recordedAt: dto.recordedAt ?? new Date().toISOString(),
    });
  }

  async getLatestLocation(id: number) {
    await this.getBus(id);
    const locations = await db.orm.public.BusLocation.where({ busId: id }).all();

    if (locations.length === 0) {
      return null;
    }

    return locations.reduce((latest, current) =>
      new Date(current.recordedAt) > new Date(latest.recordedAt)
        ? current
        : latest,
    );
  }

  async getLiveLocation(id: number) {
    return this.getLatestLocation(id);
  }
}
