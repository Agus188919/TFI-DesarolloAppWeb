import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
    type Relation,
} from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Reserva } from './reserva.entity.js';

@Entity('medicos')
export class Medico {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_usuario', type: 'int', nullable: false })
    id_usuario: number;

    @OneToOne('Usuario', 'medico', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Relation<Usuario>;

    @Column({ type: 'int', nullable: false })
    matricula: number;

    @Column({ name: 'valor_consulta', type: 'int', nullable: false })
    valor_consulta: number;

    @OneToMany('Reserva', 'medico')
    reservas: Relation<Reserva>[];
}