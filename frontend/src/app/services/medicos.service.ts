// frontend/src/app/services/medicos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico, Reserva, EstadoReserva } from '../models/types';

@Injectable({
    providedIn: 'root',
})
export class MedicosService {
    private apiUrl = 'http://localhost:3000/api/medicos';

    constructor(private http: HttpClient) { }

    listarTodos(): Observable<Medico[]> {
        return this.http.get<Medico[]>(this.apiUrl);
    }

    actualizarArancel(idMedico: number, valor_consulta: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${idMedico}/arancel`, { valor_consulta });
    }

    listarAgenda(fecha: string): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}/agenda?fecha=${fecha}`);
    }

    actualizarEstadoTurno(
        idTurno: number,
        estado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE,
    ): Observable<any> {
        return this.http.patch(`${this.apiUrl}/turnos/${idTurno}/estado`, { estado });
    }
}