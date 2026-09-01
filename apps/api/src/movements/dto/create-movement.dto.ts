import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { MovementType } from '../../generated/prisma/enums.js';

export class CreateMovementDto {
  @IsUUID()
  portfolioId!: string;

  @IsUUID()
  assetId!: string;

  @IsEnum(MovementType, {
    message: 'Tipo de movimentação inválido.',
  })
  type!: MovementType;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 8,
  })
  @Min(0.00000001, {
    message: 'A quantidade deve ser maior que zero.',
  })
  quantity!: number;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01, {
    message: 'O preço deve ser maior que zero.',
  })
  price!: number;

  @IsDateString(
    {},
    {
      message: 'Informe uma data válida.',
    },
  )
  operationDate!: string;
}
