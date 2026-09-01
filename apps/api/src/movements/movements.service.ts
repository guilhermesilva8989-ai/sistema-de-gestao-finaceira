import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';

@Injectable()
export class MovementsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.movement.findMany({
      where: {
        portfolio: {
          userId,
        },
      },

      orderBy: [
        {
          operationDate: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],

      include: {
        asset: {
          select: {
            id: true,
            name: true,
            symbol: true,
            type: true,
          },
        },

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
    dto: CreateMovementDto,
  ) {
    const asset =
      await this.prisma.asset.findFirst({
        where: {
          id: dto.assetId,
          portfolioId: dto.portfolioId,

          portfolio: {
            userId,
          },
        },
      });

    if (!asset) {
      throw new NotFoundException(
        'Ativo não encontrado nesta carteira.',
      );
    }

    const currentQuantity =
      Number(asset.quantity);

    const currentAveragePrice =
      Number(asset.averagePrice);

    const operationQuantity =
      Number(dto.quantity);

    const operationPrice =
      Number(dto.price);

    if (
      dto.type === 'SELL' &&
      operationQuantity > currentQuantity
    ) {
      throw new BadRequestException(
        `Quantidade insuficiente. Você possui ${currentQuantity} unidade(s) deste ativo.`,
      );
    }

    /*
     * Usamos meio-dia UTC em vez de meia-noite.
     *
     * Exemplo:
     * 01/09/2026 -> 2026-09-01T12:00:00.000Z
     *
     * Isso evita que fusos como UTC-3 façam a data
     * aparecer como 31/08/2026 no frontend.
     */
    const operationDate =
      new Date(
        `${dto.operationDate}T12:00:00.000Z`,
      );

    return this.prisma.$transaction(
      async (transaction) => {
        let newQuantity =
          currentQuantity;

        let newAveragePrice =
          currentAveragePrice;

        if (dto.type === 'BUY') {
          newQuantity =
            currentQuantity +
            operationQuantity;

          const currentCost =
            currentQuantity *
            currentAveragePrice;

          const operationCost =
            operationQuantity *
            operationPrice;

          newAveragePrice =
            newQuantity > 0
              ? (
                  currentCost +
                  operationCost
                ) / newQuantity
              : operationPrice;
        }

        if (dto.type === 'SELL') {
          newQuantity =
            currentQuantity -
            operationQuantity;
        }

        await transaction.asset.update({
          where: {
            id: asset.id,
          },

          data: {
            quantity:
              newQuantity.toFixed(8),

            averagePrice:
              newAveragePrice.toFixed(2),
          },
        });

        return transaction.movement.create({
          data: {
            portfolioId:
              dto.portfolioId,

            assetId:
              dto.assetId,

            type:
              dto.type,

            quantity:
              operationQuantity.toFixed(8),

            price:
              operationPrice.toFixed(2),

            operationDate,
          },

          include: {
            asset: {
              select: {
                id: true,
                name: true,
                symbol: true,
                type: true,
              },
            },

            portfolio: {
              select: {
                id: true,
                name: true,
                isDefault: true,
              },
            },
          },
        });
      },
    );
  }
}
