import { IsInt, IsISO8601, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReservaDto {
    @IsInt({ message: 'El id_medico debe ser un número entero' })
    @IsNotEmpty({ message: 'El médico es obligatorio' })
    id_medico: number;

    @IsISO8601({}, { message: 'La fecha_hora debe tener formato ISO8601 (YYYY-MM-DDTHH:mm:ssZ)' })
    @IsNotEmpty({ message: 'La fecha y hora son obligatorias' })
    fecha_hora: string;

    @IsInt({ message: 'El id_paciente debe ser un número entero' })
    @IsOptional()
    id_paciente?: number;
}