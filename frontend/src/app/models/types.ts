// frontend/src/app/models/types.ts

export enum RolUsuario {
    MEDICO = 'MEDICO',
    PACIENTE = 'PACIENTE',
    ADMINISTRADOR = 'ADMINISTRADOR',
}

export enum EstadoUsuario {
    ACTIVO = 'ACTIVO',
    BAJA = 'BAJA',
}

export enum EstadoReserva {
    ACTIVO = 'ACTIVO',
    ATENDIDO = 'ATENDIDO',
    AUSENTE = 'AUSENTE',
    CANCELADO = 'CANCELADO',
}

export interface Usuario {
    id: number;
    documento: string;
    nombres: string;
    apellidos: string;
    email: string;
    rol: RolUsuario;
    id_medico?: number | null;
}

export interface Medico {
    id: number;
    id_usuario: number;
    matricula: number;
    valor_consulta: number;
    usuario: {
        id: number;
        nombres: string;
        apellidos: string;
        email: string;
    };
}

export interface Reserva {
    id: number;
    id_medico: number;
    id_paciente: number;
    fecha_hora: string;
    estado: EstadoReserva;
    valor_consulta: number;
    medico?: {
        id: number;
        matricula: number;
        usuario: {
            nombres: string;
            apellidos: string;
        };
    };
    paciente?: {
        id: number;
        documento: string;
        nombres: string;
        apellidos: string;
        email: string;
    };
}

export interface LoginResponse {
    access_token: string;
    usuario: Usuario;
}