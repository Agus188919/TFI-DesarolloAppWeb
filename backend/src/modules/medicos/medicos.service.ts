import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Medico } from '../../entities/medico.entity.js';
import { Reserva } from '../../entities/reserva.entity.js';
import { UpdateArancelDto } from './dto/update-arancel.dto.js';
import { UpdateEstadoTurnoDto } from './dto/update-estado-turno.dto.js';
import { EstadoReserva } from '../../entities/enums.js';

@Injectable()
export class MedicosService {
    constructor(
        @InjectRepository(Medico)
        private readonly medicoRepo: Repository<Medico>,
        @InjectRepository(Reserva)
        private readonly reservaRepo: Repository<Reserva>,
    ) { }

    async listarTodos() {
        return this.medicoRepo.find({
            relations: {
                usuario: true,
            },
            select: {
                id: true,
                matricula: true,
                valor_consulta: true,
                usuario: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    email: true,
                },
            },
        });
    }

    async actualizarArancel(idMedico: number, dto: UpdateArancelDto) {
        const medico = await this.medicoRepo.findOne({ where: { id: idMedico } });
        if (!medico) {
            throw new NotFoundException('Médico no encontrado');
        }

        medico.valor_consulta = dto.valor_consulta;
        await this.medicoRepo.save(medico);

        return {
            mensaje: 'Valor de consulta actualizado con éxito',
            id_medico: medico.id,
            nuevo_valor: medico.valor_consulta,
        };
    }

    async listarAgendaPorFecha(idUsuarioMedico: number, fechaStr: string) {
        const medico = await this.medicoRepo.findOne({
            where: { id_usuario: idUsuarioMedico },
        });

        if (!medico) {
            throw new NotFoundException('Perfil de médico no encontrado para este usuario');
        }

        if (!fechaStr || isNaN(Date.parse(fechaStr))) {
            throw new BadRequestException('Formato de fecha inválido. Utilice YYYY-MM-DD');
        }

        const inicioDia = new Date(`${fechaStr}T00:00:00.000Z`);
        const finDia = new Date(`${fechaStr}T23:59:59.999Z`);

        return this.reservaRepo.find({
            where: {
                id_medico: medico.id,
                fecha_hora: Between(inicioDia, finDia),
            },
            relations: {
                paciente: true,
            },
            select: {
                id: true,
                fecha_hora: true,
                estado: true,
                valor_consulta: true,
                paciente: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    documento: true,
                    email: true,
                },
            },
            order: {
                fecha_hora: 'ASC',
            },
        });
    }

    async actualizarEstadoTurno(
        idUsuarioMedico: number,
        idTurno: number,
        dto: UpdateEstadoTurnoDto,
    ) {
        const medico = await this.medicoRepo.findOne({
            where: { id_usuario: idUsuarioMedico },
        });

        if (!medico) {
            throw new NotFoundException('No se encontro el medico');
        }

        const reserva = await this.reservaRepo.findOne({
            where: { id: idTurno },
        });

        if (!reserva)
            throw new NotFoundException('Reserva no encontrada');


        if (reserva.id_medico !== medico.id)
            throw new ForbiddenException('No tiene permisos para modificar este turno');


        if (reserva.estado === EstadoReserva.CANCELADO)
            throw new BadRequestException('No se puede modificar un turno cancelado');


        reserva.estado = dto.estado;
        await this.reservaRepo.save(reserva);

        return {
            mensaje: `Turno marcado como ${dto.estado} exitosamente`,
            turno: reserva,
        };
    }
}