import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {
    const email = dto.email
      .trim()
      .toLowerCase();

    const name = dto.name.trim();

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Já existe um usuário cadastrado com este email.',
      );
    }

    const passwordHash = await hash(
      dto.password,
      12,
    );

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,

        profile: {
          create: {
            name,
            defaultCurrency: 'BRL',
          },
        },

        portfolios: {
          create: {
            name: 'Carteira Principal',
            description:
              'Carteira principal criada automaticamente.',
            isDefault: true,
          },
        },
      },

      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,

        profile: {
          select: {
            id: true,
            name: true,
            defaultCurrency: true,
            investorProfile: true,
          },
        },

        portfolios: {
          select: {
            id: true,
            name: true,
            description: true,
            isDefault: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        profile: {
          select: {
            id: true,
            name: true,
            defaultCurrency: true,
            investorProfile: true,
          },
        },

        portfolios: {
          select: {
            id: true,
            name: true,
            description: true,
            isDefault: true,
          },
        },
      },
    });
  }

  async findForAuthentication(
    email: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        email: email
          .trim()
          .toLowerCase(),
      },
    });
  }

  async findOne(id: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,

          profile: {
            select: {
              id: true,
              name: true,
              birthDate: true,
              defaultCurrency: true,
              investorProfile: true,
            },
          },

          portfolios: {
            select: {
              id: true,
              name: true,
              description: true,
              isDefault: true,
              createdAt: true,
            },
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado.',
      );
    }

    return user;
  }
}
