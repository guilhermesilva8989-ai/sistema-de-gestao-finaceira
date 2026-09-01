import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from '../../generated/prisma/enums.js';

export class UpdateAssetDto {
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome deve ter no máximo 120 caracteres.',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, {
    message: 'O ticker deve ter no máximo 20 caracteres.',
  })
  symbol?: string;

  @IsOptional()
  @IsEnum(AssetType, {
    message: 'Tipo de ativo inválido.',
  })
  type?: AssetType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 8,
  })
  @Min(0.00000001, {
    message: 'A quantidade deve ser maior que zero.',
  })
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0, {
    message: 'O preço médio não pode ser negativo.',
  })
  averagePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0, {
    message: 'O preço atual não pode ser negativo.',
  })
  currentPrice?: number;
}
