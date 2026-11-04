import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';
import { Reserva } from '../../entities/reserva.entity.js';
import { Medico } from '../../entities/medico.entity.js';
import { Usuario } from '../../entities/usuario.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, Medico, Usuario]),
    AuthModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule { }