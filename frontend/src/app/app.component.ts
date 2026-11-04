// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service'; // Asegurate de importar el ThemeService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-layout">
      <!-- Navbar superior (Solo visible si hay sesión) -->
      <header class="navbar" *ngIf="authService.isAuthenticated()">
        <div class="nav-brand">
          <span class="brand-icon">CM |</span>
          <span class="brand-text">Clínica Médica</span>
        </div>
        
        <div class="nav-actions">
          <!-- Toggle Dark Mode -->
          <button 
            type="button" 
            class="btn-theme" 
            (click)="themeService.toggleTheme()"
            [title]="themeService.isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            {{ themeService.isDarkMode() ? '☀️' : '🌙' }}
          </button>

          <div class="divider"></div>

          <!-- Perfil Usuario -->
          <div class="user-profile">
            <div class="avatar-circle">
              {{ getIniciales() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ usuario?.nombres }} {{ usuario?.apellidos }}</span>
              <span class="user-role">{{ usuario?.rol }}</span>
            </div>
          </div>

          <!-- Botón de Salida -->
          <button class="btn-logout" (click)="authService.logout()" title="Cerrar Sesión">
            <span class="logout-text">Salir</span>
          </button>
        </div>
      </header>

      <!-- Contenedor Principal (El enrutador inyecta aquí Login o Panel) -->
      <main class="main-container">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      /* Variables heredadas del diseño general */
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --primary: #0284c7;
      --danger: #ef4444;
      --nav-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      
      display: block;
      min-height: 100vh;
      background-color: var(--bg-page);
      font-family: inherit;
    }

    :host-context(.dark),
    :host-context([data-theme="dark"]) {
      --bg-page: #0b1329;
      --bg-card: #151f38;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border-color: #263353;
      --primary: #38bdf8;
      --nav-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }

    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Navbar Moderno */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      padding: 0.75rem 2rem;
      box-shadow: var(--nav-shadow);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-text { font-size: 1.15rem; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    /* Botón Theme */
    .btn-theme {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s ease;
    }
    .btn-theme:hover { background-color: var(--border-color); transform: scale(1.05); }

    .divider { width: 1px; height: 24px; background-color: var(--border-color); }

    /* Info Usuario */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    .user-details { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
    .user-role { font-size: 0.7rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }

    /* Logout */
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      color: var(--danger);
      border: 1px solid var(--danger);
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    .btn-logout:hover { background: var(--danger); color: white; }

    /* Se removió max-width estricto del main para que el panel hijo gestione su propio ancho fluido */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    @media (max-width: 600px) {
      .user-details { display: none; }
      .logout-text { display: none; }
      .navbar { padding: 0.75rem 1rem; }
    }
  `]
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) { }

  get usuario() {
    return this.authService.getUsuario();
  }

  // Genera iniciales (ej: Juan Pérez -> JP) para el avatar circular
  getIniciales(): string {
    const u = this.usuario;
    if (!u) return '👤';
    const inicialNombre = u.nombres ? u.nombres.charAt(0) : '';
    const inicialApellido = u.apellidos ? u.apellidos.charAt(0) : '';
    return (inicialNombre + inicialApellido).toUpperCase() || 'U';
  }
}