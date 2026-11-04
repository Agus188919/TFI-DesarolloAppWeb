import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    sub: number;
    documento: string;
    email: string;
    rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'clave_secreta_super_segura_tfi_2026'),
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload) {
            throw new UnauthorizedException('Token inválido');
        }
        return {
            id: payload.sub,
            documento: payload.documento,
            email: payload.email,
            rol: payload.rol,
        };
    }
}