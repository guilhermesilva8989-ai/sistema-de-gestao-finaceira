import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @MinLength(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(80, {
    message: 'O nome deve ter no máximo 80 caracteres.',
  })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240, {
    message: 'A descrição deve ter no máximo 240 caracteres.',
  })
  description?: string;
}
