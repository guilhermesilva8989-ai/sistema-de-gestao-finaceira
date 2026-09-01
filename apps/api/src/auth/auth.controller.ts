import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import type { AuthenticatedRequest } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.usersService.findOne(
      request.user!.id,
    );
  }
}