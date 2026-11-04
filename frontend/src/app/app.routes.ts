// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login-component';
import { PanelPacienteComponent } from './components/panel-paciente/panel-paciente.component';
import { PanelMedicoComponent } from './components/panel-medico/panel-medico.component';
import { PanelAdminComponent } from './components/panel-admin/panel-admin.component';
import { roleGuard } from './guards/role.guard';
import { RolUsuario } from './models/types';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'paciente',
        component: PanelPacienteComponent,
        canActivate: [roleGuard([RolUsuario.PACIENTE])],
    },
    {
        path: 'medico',
        component: PanelMedicoComponent,
        canActivate: [roleGuard([RolUsuario.MEDICO])],
    },
    {
        path: 'admin',
        component: PanelAdminComponent,
        canActivate: [roleGuard([RolUsuario.ADMINISTRADOR])],
    },
    { path: '**', redirectTo: 'login' },
];