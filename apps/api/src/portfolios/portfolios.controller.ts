import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto.js';
import { PortfoliosService } from './portfolios.service.js';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
  ) {}

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.portfoliosService.findAll(
      request.user!.id,
    );
  }

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    createPortfolioDto: CreatePortfolioDto,
  ) {
    return this.portfoliosService.create(
      request.user!.id,
      createPortfolioDto,
    );
  }

  @Patch(':id/default')
  setDefault(
    @Req()
    request: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.portfoliosService.setDefault(
      request.user!.id,
      id,
    );
  }

  @Patch(':id')
  update(
    @Req()
    request: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfoliosService.update(
      request.user!.id,
      id,
      updatePortfolioDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req()
    request: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    await this.portfoliosService.remove(
      request.user!.id,
      id,
    );
  }
}
