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
import { AssetsService } from './assets.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
  ) {}

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.assetsService.findAll(
      request.user!.id,
    );
  }

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    createAssetDto: CreateAssetDto,
  ) {
    return this.assetsService.create(
      request.user!.id,
      createAssetDto,
    );
  }

  @Patch(':id')
  update(
    @Req()
    request: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(
      request.user!.id,
      id,
      updateAssetDto,
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
    await this.assetsService.remove(
      request.user!.id,
      id,
    );
  }
}
