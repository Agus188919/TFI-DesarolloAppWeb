import { IsInt, Min } from 'class-validator';

export class UpdateArancelDto {
    @IsInt({ message: 'El valor de la consulta debe ser un Numero' })
    @Min(1, { message: 'El valor de la consulta debe ser mayor a 0' })
    valor_consulta: number;
}