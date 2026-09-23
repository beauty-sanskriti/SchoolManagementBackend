import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LibraryController } from './library.controller.js';
import { LibraryService } from './library.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
