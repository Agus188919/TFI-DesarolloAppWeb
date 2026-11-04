import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolUsuario } from '../../entities/enums.js';
import { MedicosService } from './medicos.service.js';
import { UpdateArancelDto } from './dto/update-arancel.dto.js';
import { UpdateEstadoTurnoDto } from './dto/update-estado-turno.dto.js';

@Controller('medicos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) { }

    @Get()
    async listarTodos() {
        return this.medicosService.listarTodos();
    }

    @Patch(':id/arancel')
    @Roles(RolUsuario.ADMINISTRADOR)
    async actualizarArancel(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateArancelDto,
    ) {
        return this.medicosService.actualizarArancel(id, dto);
    }

    @Get('agenda')
    @Roles(RolUsuario.MEDICO)
    async listarAgenda(
        @Request() req: any,
        @Query('fecha') fecha: string,
    ) {
        return this.medicosService.listarAgendaPorFecha(req.user.id, fecha);
    }

    @Patch('turnos/:id/estado')
    @Roles(RolUsuario.MEDICO)
    async actualizarEstadoTurno(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstadoTurnoDto,
    ) {
        return this.medicosService.actualizarEstadoTurno(req.user.id, id, dto);
    }
}