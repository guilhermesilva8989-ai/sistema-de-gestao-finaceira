import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto.js';

@Injectable()
export class PortfoliosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.portfolio.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'asc',
        },
      ],

      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(
    userId: string,
    dto: CreatePortfolioDto,
  ) {
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestException(
        'Informe um nome para a carteira.',
      );
    }

    return this.prisma.portfolio.create({
      data: {
        userId,
        name,
        description:
          dto.description?.trim() || null,
        isDefault: false,
      },

      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    userId: string,
    portfolioId: string,
    dto: UpdatePortfolioDto,
  ) {
    await this.findOwned(
      userId,
      portfolioId,
    );

    const data: {
      name?: string;
      description?: string | null;
    } = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException(
          'Informe um nome para a carteira.',
        );
      }

      data.name = name;
    }

    if (dto.description !== undefined) {
      data.description =
        dto.description.trim() || null;
    }

    return this.prisma.portfolio.update({
      where: {
        id: portfolioId,
      },

      data,

      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async setDefault(
    userId: string,
    portfolioId: string,
  ) {
    await this.findOwned(
      userId,
      portfolioId,
    );

    await this.prisma.$transaction([
      this.prisma.portfolio.updateMany({
        where: {
          userId,
          isDefault: true,
        },

        data: {
          isDefault: false,
        },
      }),

      this.prisma.portfolio.update({
        where: {
          id: portfolioId,
        },

        data: {
          isDefault: true,
        },
      }),
    ]);

    return this.findOwned(
      userId,
      portfolioId,
    );
  }

  async remove(
    userId: string,
    portfolioId: string,
  ) {
    const portfolio =
      await this.findOwned(
        userId,
        portfolioId,
      );

    if (portfolio.isDefault) {
      throw new BadRequestException(
        'A carteira principal não pode ser excluída. Defina outra carteira como principal primeiro.',
      );
    }

    await this.prisma.portfolio.delete({
      where: {
        id: portfolioId,
      },
    });
  }

  private async findOwned(
    userId: string,
    portfolioId: string,
  ) {
    const portfolio =
      await this.prisma.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId,
        },

        select: {
          id: true,
          name: true,
          description: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!portfolio) {
      throw new NotFoundException(
        'Carteira não encontrada.',
      );
    }

    return portfolio;
  }
}
