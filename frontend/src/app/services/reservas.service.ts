// frontend/src/app/services/reservas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/types';

export interface CreateReservaPayload {
    id_medico: number;
    fecha_hora: string;
    id_paciente?: number;
}

@Injectable({
    providedIn: 'root',
})
export class ReservasService {
    private apiUrl = 'http://localhost:3000/api/reservas';

    constructor(private http: HttpClient) { }

    listarReservas(): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(this.apiUrl);
    }

    crearReserva(payload: CreateReservaPayload): Observable<any> {
        return this.http.post(this.apiUrl, payload);
    }

    cancelarReserva(idReserva: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${idReserva}/cancelar`, {});
    }
}