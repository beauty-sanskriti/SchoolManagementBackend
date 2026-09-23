import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ReportsAnalyticsController } from './reports-analytics.controller.js';
import { ReportsAnalyticsService } from './reports-analytics.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ReportsAnalyticsController],
  providers: [ReportsAnalyticsService],
})
export class ReportsAnalyticsModule {}
