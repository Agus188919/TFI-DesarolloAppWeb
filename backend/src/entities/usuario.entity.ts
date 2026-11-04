import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    type Relation,
} from 'typeorm';
import { EstadoUsuario, RolUsuario } from './enums.js';
import { Medico } from './medico.entity.js';
import { Reserva } from './reserva.entity.js';

@Entity('usuarios')
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', unique: true, nullable: false })
    documento: string;

    @Column({ type: 'text', nullable: false })
    apellidos: string;

    @Column({ type: 'text', nullable: false })
    nombres: string;

    @Column({ type: 'text', nullable: false })
    email: string;

    @Column({ type: 'text', nullable: false })
    clave: string;

    @Column({
        type: 'enum',
        enum: EstadoUsuario,
        default: EstadoUsuario.ACTIVO,
        nullable: false,
    })
    estado: EstadoUsuario;

    @Column({
        type: 'enum',
        enum: RolUsuario,
        nullable: false,
    })
    rol: RolUsuario;

    @OneToOne('Medico', 'usuario')
    medico?: Relation<Medico>;

    @OneToMany('Reserva', 'paciente')
    reservasPaciente: Relation<Reserva>[];
}