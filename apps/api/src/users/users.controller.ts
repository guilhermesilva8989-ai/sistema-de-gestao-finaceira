import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      createUserDto,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
