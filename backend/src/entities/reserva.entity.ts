import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    type Relation,
} from 'typeorm';
import { EstadoReserva } from './enums.js';
import { Medico } from './medico.entity.js';
import { Usuario } from './usuario.entity.js';

@Entity('reservas')
export class Reserva {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_medico', type: 'int', nullable: false })
    id_medico: number;

    @ManyToOne('Medico', 'reservas', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_medico' })
    medico: Relation<Medico>;

    @Column({ name: 'id_paciente', type: 'int', nullable: false })
    id_paciente: number;

    @ManyToOne('Usuario', 'reservasPaciente', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_paciente' })
    paciente: Relation<Usuario>;

    @Column({ name: 'fecha_hora', type: 'timestamp', nullable: false })
    fecha_hora: Date;

    @Column({
        type: 'enum',
        enum: EstadoReserva,
        default: EstadoReserva.ACTIVO,
        nullable: false,
    })
    estado: EstadoReserva;

    @Column({ name: 'valor_consulta', type: 'int', nullable: false })
    valor_consulta: number;
}