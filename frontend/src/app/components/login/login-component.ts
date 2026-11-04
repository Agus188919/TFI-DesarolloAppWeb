import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RolUsuario } from '../../models/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <button 
        type="button" 
        class="theme-toggle-btn" 
        (click)="toggleTheme()" 
        [title]="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <span>{{ isDarkMode ? '☀️' : '🌙' }}</span>
      </button>

      <div class="login-card">
        <div class="card-header">
          <div class="logo-icon">CM</div>
          <h2>Clínica Médica</h2>
          <p class="subtitle">Gestión de Turnos y Consultas</p>
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="identificador">Documento o Correo</label>
            <input
              type="text"
              id="identificador"
              name="identificador"
              [(ngModel)]="identificador"
              placeholder="Email/Identificador"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="clave">Contraseña</label>
            <div class="password-field">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="clave"
                name="clave"
                [(ngModel)]="clave"
                placeholder="Contraseña"
                required
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="btn-toggle-eye" 
                (click)="showPassword = !showPassword"
                tabindex="-1"
              >
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --input-bg: #ffffff;
      --primary: #0284c7;
      --primary-hover: #0369a1;
      --card-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      
      display: block;
      width: 100%;
    }

    :host-context(.dark),
    :host-context([data-theme="dark"]) {
      --bg-page: #0b1329;
      --bg-card: #151f38;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border-color: #263353;
      --input-bg: #0b1329;
      --primary: #38bdf8;
      --primary-hover: #0284c7;
      --card-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    }

    .login-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bg-page);
      padding: 1.5rem;
      box-sizing: border-box;
      transition: background-color 0.25s ease;
      z-index: 10;
    }

    .theme-toggle-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: transform 0.15s ease;
      z-index: 20;
    }
    .theme-toggle-btn:hover {
      transform: scale(1.08);
    }

    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 2.25rem 2rem;
      border-radius: 12px;
      box-shadow: var(--card-shadow);
      width: 100%;
      max-width: 420px;
      box-sizing: border-box;
      transition: background-color 0.25s ease, border-color 0.25s ease;
      margin: auto;
    }

    .card-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .logo-icon {
      font-size: 2.2rem;
      margin-bottom: 0.25rem;
    }
    h2 {
      margin: 0;
      color: var(--text-main);
      font-size: 1.45rem;
      font-weight: 700;
    }
    .subtitle {
      margin: 0.35rem 0 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .form-group {
      margin-bottom: 1.2rem;
    }
    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-main);
    }
    input {
      width: 100%;
      padding: 0.75rem 0.85rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--input-bg);
      color: var(--text-main);
      font-size: 0.95rem;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }
    input:focus {
      border-color: var(--primary);
    }

    .password-field {
      position: relative;
      display: flex;
      align-items: center;
    }
    .password-field input {
      padding-right: 4.5rem;
    }
    .btn-toggle-eye {
      position: absolute;
      right: 0.6rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.25rem 0.4rem;
    }
    .btn-toggle-eye:hover {
      color: var(--primary);
    }

    .btn-submit {
      width: 100%;
      padding: 0.8rem;
      margin-top: 0.5rem;
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, opacity 0.2s ease;
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--primary-hover);
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-box {
      margin-top: 1.25rem;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
      border-radius: 6px;
      font-size: 0.85rem;
      text-align: center;
    }

    .demo-hints {
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.15);
      border: 1px dashed var(--border-color);
      border-radius: 8px;
    }
    .hints-title {
      margin: 0 0 0.5rem;
      font-weight: 600;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .hint-item {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
      font-size: 0.78rem;
      margin-bottom: 0.35rem;
      background: transparent !important;
    }
    .hint-item:last-child {
      margin-bottom: 0;
    }
    .role-badge {
      font-weight: 600;
      color: var(--primary);
      background: transparent !important;
    }
    .hint-text {
      color: var(--text-main);
      font-family: monospace;
      background: transparent !important; 
    }
  `]
})
export class LoginComponent implements OnInit {
  identificador = '';
  clave = '';
  loading = false;
  errorMessage = '';
  showPassword = false;
  isDarkMode = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.applyTheme(this.isDarkMode);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
  }

  private applyTheme(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  onLogin(): void {
    if (!this.identificador || !this.clave) {
      this.errorMessage = 'Debe completar todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.identificador, this.clave).subscribe({
      next: (res) => {
        this.loading = false;
        const rol = res.usuario.rol;
        if (rol === RolUsuario.ADMINISTRADOR) {
          this.router.navigate(['/admin']);
        } else if (rol === RolUsuario.MEDICO) {
          this.router.navigate(['/medico']);
        } else if (rol === RolUsuario.PACIENTE) {
          this.router.navigate(['/paciente']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      }
    });
  }
}