import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoReserva } from '../../../entities/enums.js';

export class UpdateEstadoTurnoDto {
    @IsNotEmpty({ message: 'El estado es requerido' })
    @IsEnum([EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE], {
        message: 'El médico solo puede marcar el turno como ATENDIDO o AUSENTE',
    })
    estado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE;
}