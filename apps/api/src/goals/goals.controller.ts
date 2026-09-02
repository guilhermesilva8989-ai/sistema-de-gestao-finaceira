import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(
    private readonly goalsService: GoalsService,
  ) {}

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.goalsService.findAll(
      request.user!.id,
    );
  }

  @Get(':id')
  findOne(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.goalsService.findOne(
      request.user!.id,
      id,
    );
  }

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    createGoalDto: CreateGoalDto,
  ) {
    return this.goalsService.create(
      request.user!.id,
      createGoalDto,
    );
  }

  @Patch(':id')
  update(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    id: string,

    @Body()
    updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(
      request.user!.id,
      id,
      updateGoalDto,
    );
  }

  @Delete(':id')
  remove(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.goalsService.remove(
      request.user!.id,
      id,
    );
  }
}
