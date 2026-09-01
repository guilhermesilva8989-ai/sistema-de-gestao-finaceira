import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.asset.findMany({
      where: {
        portfolio: {
          userId,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });
  }

  async create(
    userId: string,
    dto: CreateAssetDto,
  ) {
    await this.findPortfolio(
      userId,
      dto.portfolioId,
    );

    return this.prisma.asset.create({
      data: {
        portfolioId: dto.portfolioId,
        name: dto.name.trim(),

        symbol:
          dto.symbol?.trim().toUpperCase() ||
          null,

        type: dto.type,
        quantity: dto.quantity,
        averagePrice: dto.averagePrice,

        currentPrice:
          dto.currentPrice ?? null,
      },

      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });
  }

  async update(
    userId: string,
    assetId: string,
    dto: UpdateAssetDto,
  ) {
    await this.findOwned(
      userId,
      assetId,
    );

    if (dto.portfolioId) {
      await this.findPortfolio(
        userId,
        dto.portfolioId,
      );
    }

    return this.prisma.asset.update({
      where: {
        id: assetId,
      },

      data: {
        ...(dto.portfolioId !== undefined && {
          portfolioId: dto.portfolioId,
        }),

        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),

        ...(dto.symbol !== undefined && {
          symbol:
            dto.symbol.trim().toUpperCase() ||
            null,
        }),

        ...(dto.type !== undefined && {
          type: dto.type,
        }),

        ...(dto.quantity !== undefined && {
          quantity: dto.quantity,
        }),

        ...(dto.averagePrice !== undefined && {
          averagePrice: dto.averagePrice,
        }),

        ...(dto.currentPrice !== undefined && {
          currentPrice: dto.currentPrice,
        }),
      },

      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });
  }

  async remove(
    userId: string,
    assetId: string,
  ) {
    await this.findOwned(
      userId,
      assetId,
    );

    await this.prisma.asset.delete({
      where: {
        id: assetId,
      },
    });
  }

  private async findOwned(
    userId: string,
    assetId: string,
  ) {
    const asset =
      await this.prisma.asset.findFirst({
        where: {
          id: assetId,

          portfolio: {
            userId,
          },
        },
      });

    if (!asset) {
      throw new NotFoundException(
        'Ativo não encontrado.',
      );
    }

    return asset;
  }

  private async findPortfolio(
    userId: string,
    portfolioId: string,
  ) {
    const portfolio =
      await this.prisma.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId,
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
