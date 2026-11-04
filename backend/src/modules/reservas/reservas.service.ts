import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Reserva } from '../../entities/reserva.entity.js';
import { Medico } from '../../entities/medico.entity.js';
import { Usuario } from '../../entities/usuario.entity.js';
import { EstadoReserva, RolUsuario } from '../../entities/enums.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';

@Injectable()
export class ReservasService {
    constructor(
        @InjectRepository(Reserva)
        private readonly reservaRepo: Repository<Reserva>,
        @InjectRepository(Medico)
        private readonly medicoRepo: Repository<Medico>,
        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
    ) { }

    async crearReserva(usuarioActual: { id: number; rol: string }, dto: CreateReservaDto) {
        const fechaReserva = new Date(dto.fecha_hora);

        if (isNaN(fechaReserva.getTime())) {
            throw new BadRequestException('Fecha y hora inválidas');
        }

        const ahora = new Date();
        if (fechaReserva < ahora)
            throw new BadRequestException('No se pueden reservar turnos en fechas u horas pasadas');


        const limite30Dias = new Date();
        limite30Dias.setDate(limite30Dias.getDate() + 30);
        if (fechaReserva > limite30Dias)
            throw new BadRequestException('Las reservas solo se pueden realizar con un máximo de 30 días de anticipación');


        const hora = fechaReserva.getUTCHours();
        const minutos = fechaReserva.getUTCMinutes();
        const segundos = fechaReserva.getUTCSeconds();

        if (hora < 8 || hora >= 16 || minutos !== 0 || segundos !== 0) {
            throw new BadRequestException(
                'El horario de atención es de 08:00 a 16:00 hs en turnos puntuales de 1 hora (ej: 08:00, 09:00)',
            );
        }

        const medico = await this.medicoRepo.findOne({
            where: { id: dto.id_medico },
        });
        if (!medico)
            throw new NotFoundException('Médico no encontrado');

        let idPaciente = usuarioActual.id;
        if (usuarioActual.rol === RolUsuario.ADMINISTRADOR) {
            if (!dto.id_paciente) {
                throw new BadRequestException('El administrador debe especificar el paciente');
            }
            const paciente = await this.usuarioRepo.findOne({
                where: { id: dto.id_paciente },
            });
            if (!paciente) {
                throw new NotFoundException('Paciente no encontrado');
            }
            idPaciente = paciente.id;
        }

        const turnoExistente = await this.reservaRepo.findOne({
            where: {
                id_medico: medico.id,
                fecha_hora: fechaReserva,
                estado: Not(EstadoReserva.CANCELADO),
            },
        });

        if (turnoExistente) {
            throw new ConflictException('El horario seleccionado ya se encuentra ocupado para este médico');
        }

        const nuevaReserva = this.reservaRepo.create({
            id_medico: medico.id,
            id_paciente: idPaciente,
            fecha_hora: fechaReserva,
            estado: EstadoReserva.ACTIVO,
            valor_consulta: medico.valor_consulta,
        });

        const guardada = await this.reservaRepo.save(nuevaReserva);

        return {
            mensaje: 'Reserva creada exitosamente',
            reserva: guardada,
        };
    }

    async listarReservas(usuarioActual: { id: number; rol: string }) {
        if (usuarioActual.rol === RolUsuario.ADMINISTRADOR) {
            return this.reservaRepo.find({
                relations: {
                    medico: { usuario: true },
                    paciente: true,
                },
                order: { fecha_hora: 'DESC' },
            });
        }

        if (usuarioActual.rol === RolUsuario.PACIENTE) {
            return this.reservaRepo.find({
                where: { id_paciente: usuarioActual.id },
                relations: {
                    medico: { usuario: true },
                },
                order: { fecha_hora: 'DESC' },
            });
        }

        throw new ForbiddenException('Rol no habilitado para listar reservas desde este módulo');
    }

    async cancelarReserva(idReserva: number, usuarioActual: { id: number; rol: string }) {
        const reserva = await this.reservaRepo.findOne({
            where: { id: idReserva },
        });

        if (!reserva)
            throw new NotFoundException('Reserva no encontrada');


        if (reserva.estado === EstadoReserva.CANCELADO)
            throw new BadRequestException('La reserva ya se encuentra cancelada');

        const ahora = new Date();
        const fechaConsulta = new Date(reserva.fecha_hora);

        if (usuarioActual.rol === RolUsuario.PACIENTE) {
            if (reserva.id_paciente !== usuarioActual.id)
                throw new ForbiddenException('No tiene permisos para cancelar este turno');


            const inicioDiaConsulta = new Date(fechaConsulta);
            inicioDiaConsulta.setHours(0, 0, 0, 0);

            if (ahora >= inicioDiaConsulta) {
                throw new BadRequestException(
                    'Los pacientes solo pueden cancelar turnos hasta el día anterior a la consulta',
                );
            }
        }

        if (usuarioActual.rol === RolUsuario.ADMINISTRADOR) {
            if (ahora >= fechaConsulta) {
                throw new BadRequestException(
                    'Solo se puede cancelar el turno hasta el momento exacto en que inicia la consulta',
                );
            }
        }

        reserva.estado = EstadoReserva.CANCELADO;
        await this.reservaRepo.save(reserva);

        return {
            mensaje: 'Turno cancelado exitosamente',
            reserva,
        };
    }
}