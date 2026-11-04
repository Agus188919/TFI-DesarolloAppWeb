import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/index.js';
import { RolUsuario } from '../../entities/enums.js';
import { ReservasService } from './reservas.service.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';

@Controller('reservas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReservasController {
    constructor(private readonly reservasService: ReservasService) { }

    @Post()
    @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
    async crearReserva(@Request() req: any, @Body() dto: CreateReservaDto) {
        return this.reservasService.crearReserva(req.user, dto);
    }

    @Get()
    @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
    async listarReservas(@Request() req: any) {
        return this.reservasService.listarReservas(req.user);
    }

    @Patch(':id/cancelar')
    @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
    async cancelarReserva(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.reservasService.cancelarReserva(id, req.user);
    }
}