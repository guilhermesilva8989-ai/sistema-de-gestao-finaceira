import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user =
      await this.usersService.findForAuthentication(
        dto.email,
      );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Email ou senha inválidos.',
      );
    }

    const passwordMatches =
      await compare(
        dto.password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Email ou senha inválidos.',
      );
    }

    const accessToken =
      await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: '1d',
        },
      );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
