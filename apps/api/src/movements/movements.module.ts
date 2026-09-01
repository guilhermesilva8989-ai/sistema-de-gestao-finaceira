import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MovementsController } from './movements.controller.js';
import { MovementsService } from './movements.service.js';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    MovementsController,
  ],

  providers: [
    MovementsService,
  ],
})
export class MovementsModule {}
