import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString({ message: 'El documento o email debe ser texto' })
    @IsNotEmpty({ message: 'El identificador (documento o email) es requerido' })
    identificador: string;

    @IsString({ message: 'La clave debe ser texto' })
    @IsNotEmpty({ message: 'La clave es requerida' })
    @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
    clave: string;
}