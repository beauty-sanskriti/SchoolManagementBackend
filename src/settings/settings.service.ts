import { Injectable, NotFoundException } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class SettingsService {
  private async getOrCreate(schoolId: number) {
    const existing = await db.orm.public.SchoolSetting
      .where({ schoolId })
      .first();

    if (existing) {
      return existing;
    }

    return db.orm.public.SchoolSetting.create({ schoolId });
  }

  // GET /settings
  async getSettings(currentUser: any) {
    return this.getOrCreate(currentUser.schoolId);
  }

  // PATCH /settings
  async updateSettings(dto: any, currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    await db.orm.public.SchoolSetting.where({ id: settings.id }).update({
      ...dto,
    });
    return this.getSettings(currentUser);
  }

  // GET /settings/branding
  async getBranding(currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    return {
      branding: settings.branding,
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
    };
  }

  // PATCH /settings/branding
  async updateBranding(dto: any, currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    await db.orm.public.SchoolSetting.where({ id: settings.id }).update({
      branding: dto.branding,
      logoUrl: dto.logoUrl,
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
    });
    return this.getBranding(currentUser);
  }

  // GET /settings/permissions
  async getPermissions(currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    return { permissions: settings.permissions };
  }

  // PATCH /settings/permissions
  async updatePermissions(permissions: any, currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    await db.orm.public.SchoolSetting.where({ id: settings.id }).update({
      permissions: JSON.stringify(permissions),
    });
    return this.getPermissions(currentUser);
  }

  // GET /settings/integrations
  async getIntegrations(currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    return { integrations: settings.integrations };
  }

  // PATCH /settings/integrations
  async updateIntegrations(integrations: any, currentUser: any) {
    const settings = await this.getOrCreate(currentUser.schoolId);
    await db.orm.public.SchoolSetting.where({ id: settings.id }).update({
      integrations: JSON.stringify(integrations),
    });
    return this.getIntegrations(currentUser);
  }
}
