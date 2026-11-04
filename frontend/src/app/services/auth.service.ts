// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginResponse, RolUsuario, Usuario } from '../models/types';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';
    private tokenKey = 'clinica_jwt_token';
    private userKey = 'clinica_user_data';

    constructor(private http: HttpClient, private router: Router) { }

    login(identificador: string, clave: string): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${this.apiUrl}/login`, { identificador, clave })
            .pipe(
                tap((res) => {
                    localStorage.setItem(this.tokenKey, res.access_token);
                    localStorage.setItem(this.userKey, JSON.stringify(res.usuario));
                }),
            );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getUsuario(): Usuario | null {
        const data = localStorage.getItem(this.userKey);
        return data ? JSON.parse(data) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getRol(): RolUsuario | null {
        const user = this.getUsuario();
        return user ? user.rol : null;
    }
}