import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicosService } from './medicos.service.js';
import { MedicosController } from './medicos.controller.js';
import { Medico } from '../../entities/medico.entity.js';
import { Reserva } from '../../entities/reserva.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medico, Reserva]),
    AuthModule,
  ],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class MedicosModule { }