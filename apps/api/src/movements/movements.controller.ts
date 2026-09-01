import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';
import { MovementsService } from './movements.service.js';

@Controller('movements')
@UseGuards(JwtAuthGuard)
export class MovementsController {
  constructor(
    private readonly movementsService: MovementsService,
  ) {}

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.movementsService.findAll(
      request.user!.id,
    );
  }

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    createMovementDto: CreateMovementDto,
  ) {
    return this.movementsService.create(
      request.user!.id,
      createMovementDto,
    );
  }
}
