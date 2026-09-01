import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(80, {
    message: 'O nome deve ter no máximo 80 caracteres.',
  })
  name!: string;

  @IsEmail(
    {},
    {
      message: 'Informe um email válido.',
    },
  )
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'A senha deve ter pelo menos 8 caracteres.',
  })
  @MaxLength(72, {
    message: 'A senha deve ter no máximo 72 caracteres.',
  })
  password!: string;
}
