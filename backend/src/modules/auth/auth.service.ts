import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity.js';
import { EstadoUsuario } from '../../entities/enums.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const { identificador, clave } = loginDto;
        const usuario = await this.usuarioRepo.findOne({
            where: [
                { documento: identificador },
                { email: identificador },
            ],
            relations: {
                medico: true,
            },
        });

        if (!usuario)
            throw new UnauthorizedException('Credenciales incorrectas');

        if (usuario.estado !== EstadoUsuario.ACTIVO)
            throw new UnauthorizedException('El usuario no se encuentra activo en el sistema');

        const passwordOk = await bcrypt.compare(clave, usuario.clave);
        if (!passwordOk) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Armo payload
        const payload = {
            sub: usuario.id,
            documento: usuario.documento,
            email: usuario.email,
            rol: usuario.rol,
            id_medico: usuario.medico ? usuario.medico.id : null,
        };

        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
            usuario: {
                id: usuario.id,
                documento: usuario.documento,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                email: usuario.email,
                rol: usuario.rol,
                id_medico: usuario.medico ? usuario.medico.id : null,
            },
        };
    }
}