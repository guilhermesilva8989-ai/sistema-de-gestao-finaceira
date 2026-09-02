import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @MinLength(2, {
    message: 'O nome da meta deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(100, {
    message: 'O nome da meta deve ter no máximo 100 caracteres.',
  })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'A descrição deve ter no máximo 500 caracteres.',
  })
  description?: string;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01, {
    message: 'O valor objetivo deve ser maior que zero.',
  })
  targetAmount!: number;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0, {
    message: 'O valor atual não pode ser negativo.',
  })
  currentAmount!: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'Informe uma data válida.',
    },
  )
  targetDate?: string;
}
