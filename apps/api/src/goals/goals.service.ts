import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    userId: string,
    id: string,
  ) {
    const goal =
      await this.prisma.goal.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!goal) {
      throw new NotFoundException(
        'Meta não encontrada.',
      );
    }

    return goal;
  }

  async create(
    userId: string,
    dto: CreateGoalDto,
  ) {
    return this.prisma.goal.create({
      data: {
        userId,

        name:
          dto.name.trim(),

        description:
          dto.description?.trim() ||
          null,

        targetAmount:
          dto.targetAmount.toFixed(2),

        currentAmount:
          dto.currentAmount.toFixed(2),

        targetDate:
          dto.targetDate
            ? new Date(
                `${dto.targetDate}T12:00:00.000Z`,
              )
            : null,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateGoalDto,
  ) {
    await this.findOne(
      userId,
      id,
    );

    return this.prisma.goal.update({
      where: {
        id,
      },

      data: {
        ...(dto.name !== undefined
          ? {
              name:
                dto.name.trim(),
            }
          : {}),

        ...(dto.description !== undefined
          ? {
              description:
                dto.description.trim() ||
                null,
            }
          : {}),

        ...(dto.targetAmount !== undefined
          ? {
              targetAmount:
                dto.targetAmount.toFixed(
                  2,
                ),
            }
          : {}),

        ...(dto.currentAmount !== undefined
          ? {
              currentAmount:
                dto.currentAmount.toFixed(
                  2,
                ),
            }
          : {}),

        ...(dto.targetDate !== undefined
          ? {
              targetDate:
                dto.targetDate
                  ? new Date(
                      `${dto.targetDate}T12:00:00.000Z`,
                    )
                  : null,
            }
          : {}),
      },
    });
  }

  async remove(
    userId: string,
    id: string,
  ) {
    await this.findOne(
      userId,
      id,
    );

    await this.prisma.goal.delete({
      where: {
        id,
      },
    });

    return {
      message:
        'Meta excluída com sucesso.',
    };
  }
}
