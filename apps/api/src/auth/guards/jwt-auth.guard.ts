import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { Request } from 'express';

export interface AuthenticatedRequest
  extends Request {
  user?: {
    id: string;
    email: string;
  };
}

@Injectable()
export class JwtAuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Token de autenticação não informado.',
      );
    }

    const [type, token] =
      authorization.split(' ');

    if (
      type !== 'Bearer' ||
      !token
    ) {
      throw new UnauthorizedException(
        'Token de autenticação inválido.',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<{
          sub: string;
          email: string;
        }>(token);

      request.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Token inválido ou expirado.',
      );
    }
  }
}