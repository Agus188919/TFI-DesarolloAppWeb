// frontend/src/app/guards/role.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/types';

export const roleGuard = (allowedRoles: RolUsuario[]): CanActivateFn => {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isAuthenticated()) {
            router.navigate(['/login']);
            return false;
        }

        const currentRol = authService.getRol();
        if (currentRol && allowedRoles.includes(currentRol)) {
            return true;
        }

        alert('Acceso no autorizado para tu rol');
        authService.logout();
        return false;
    };
};