// frontend/src/app/components/panel-paciente/panel-paciente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservasService } from '../../services/reservas.service';
import { MedicosService } from '../../services/medicos.service';
import { Medico, Reserva, EstadoReserva } from '../../models/types';

@Component({
  selector: 'app-panel-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-container">
      
      <div class="hero-header">
        <div class="hero-content">
          <div>
            <h1 class="hero-title">Portal del Paciente</h1>
            <p class="hero-subtitle">Gestioná tus turnos médicos y consultá tu historial de reservas.</p>
          </div>
          <div class="hero-icon">🩺</div>
        </div>
        
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-label">Turnos Próximos</span>
            <span class="stat-value text-primary">{{ turnosActivos }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Histórico</span>
            <span class="stat-value">{{ reservas.length }}</span>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        
        <section class="card">
          <div class="card-header">
            <h3>Reservar Nueva Consulta</h3>
            <span class="subtitle-hint">Seleccioná el profesional, fecha y horario de tu preferencia.</span>
          </div>
          
          <div class="card-body">
            <form (ngSubmit)="onReservar()">
              <div class="form-grid">
                
                <div class="form-group">
                  <label>Especialista</label>
                  <div class="input-with-icon">
                    <span class="input-icon">👨‍⚕️</span>
                    <select [(ngModel)]="idMedicoSeleccionado" name="idMedico" (change)="onMedicoChange()" required>
                      <option [ngValue]="null">-- Elegí un profesional --</option>
                      <option *ngFor="let m of medicos" [ngValue]="m.id">
                        Dr. {{ m.usuario.nombres }} {{ m.usuario.apellidos }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Fecha de Consulta</label>
                  <div class="input-with-icon">
                    <span class="input-icon">📅</span>
                    <input 
                      type="date" 
                      [(ngModel)]="fechaSeleccionada" 
                      name="fecha" 
                      [min]="minDate" 
                      [max]="maxDate" 
                      (change)="generarHorarios()" 
                      required 
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Horario Disponible</label>
                  <div class="input-with-icon">
                    <span class="input-icon">🕒</span>
                    <select [(ngModel)]="horaSeleccionada" name="hora" required [disabled]="!fechaSeleccionada">
                      <option value="">-- Elegí un horario --</option>
                      <option *ngFor="let h of horariosDisponibles" [value]="h">{{ h }} hs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="resumen-reserva" *ngIf="arancelCongelado">
                <div class="resumen-info">
                  <span class="resumen-label">Arancel de la consulta:</span>
                  <span class="resumen-valor">$ {{ arancelCongelado | number:'1.0-0' }}</span>
                </div>
                <p class="resumen-nota">Al confirmar, este valor quedará congelado para tu turno.</p>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-solid-primary" [disabled]="loading || !idMedicoSeleccionado || !fechaSeleccionada || !horaSeleccionada">
                  {{ loading ? 'Procesando Reserva...' : 'Confirmar Turno' }}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h3>Mis Reservas Registradas</h3>
          </div>
          
          <div class="table-responsive" *ngIf="reservas.length > 0; else sinReservas">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Médico</th>
                  <th>Arancel Congelado</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of reservas">
                  <td class="col-fecha">
                    <strong>{{ r.fecha_hora | date:'dd/MM/yyyy' }}</strong><br>
                    <span class="text-muted">{{ r.fecha_hora | date:'HH:mm' }} hs</span>
                  </td>
                  <td>
                    <div class="user-info">
                      <span class="avatar">👨‍⚕️</span>
                      <strong>Dr. {{ r.medico?.usuario?.nombres }} {{ r.medico?.usuario?.apellidos }}</strong>
                    </div>
                  </td>
                  <td><strong>$ {{ r.valor_consulta | number:'1.0-0' }}</strong></td>
                  <td class="text-center">
                    <span class="status-badge" [ngClass]="r.estado.toLowerCase()">{{ r.estado }}</span>
                  </td>
                  <td class="text-center">
                    <button
                      *ngIf="r.estado === estadoReserva.ACTIVO"
                      class="btn-action-danger"
                      (click)="abrirModalCancelar(r.id)"
                      title="Cancelar Turno">
                      Cancelar
                    </button>
                    <span *ngIf="r.estado !== estadoReserva.ACTIVO" class="text-muted small">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #sinReservas>
            <div class="empty-state">
              <span class="empty-icon">📂</span>
              <p>Todavía no tenés reservas médicas registradas.</p>
            </div>
          </ng-template>
        </section>
      </div>

      <div class="modal-backdrop" *ngIf="mostrarModalCancelar">
        <div class="modal-box">
          <div class="modal-icon text-danger">⚠️</div>
          <h4>Confirmar Cancelación</h4>
          <p>¿Estás seguro de que querés cancelar este turno?</p>
          <p class="modal-subtext">Recordá que por política de la clínica, los pacientes solo pueden cancelar turnos con fecha futura (hasta el día anterior).</p>
          
          <div class="modal-actions">
            <button class="btn-outline" (click)="cerrarModalCancelar()">Volver</button>
            <button class="btn-solid-danger" (click)="confirmarCancelacion()">Sí, Cancelar Turno</button>
          </div>
        </div>
      </div>

      <div class="toast-notification" [class.show]="popupNotificacion.visible" [ngClass]="popupNotificacion.tipo">
        <span class="toast-icon">{{ popupNotificacion.tipo === 'exito' ? '✅' : '❌' }}</span>
        <div class="toast-content">
          <strong>{{ popupNotificacion.titulo }}</strong>
          <span>{{ popupNotificacion.mensaje }}</span>
        </div>
        <button class="toast-close" (click)="cerrarNotificacion()">✕</button>
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
      --danger: #ef4444;
      --danger-hover: #dc2626;
      
      --hero-bg-1: #10b981; 
      --hero-bg-2: #047857;
      --hero-text: #ffffff;
      
      display: block;
      min-height: 100vh;
      background-color: var(--bg-page);
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
      
      --hero-bg-1: #064e3b;
      --hero-bg-2: #022c22;
    }

    .panel-container { font-family: inherit; padding-bottom: 3rem; }

    .hero-header {
      background: linear-gradient(135deg, var(--hero-bg-1), var(--hero-bg-2));
      padding: 3rem 2rem 5rem 2rem;
      color: var(--hero-text);
      position: relative;
    }
    .hero-content { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .hero-title { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
    .hero-subtitle { margin: 0.5rem 0 0 0; font-size: 1.1rem; opacity: 0.9; }
    .hero-icon { font-size: 4rem; opacity: 0.2; }

    .stats-row {
      max-width: 1100px; margin: 0 auto; display: flex; gap: 1.5rem; position: absolute;
      bottom: -2.5rem; left: 0; right: 0; padding: 0 2rem;
    }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px;
      padding: 1rem 1.5rem; display: flex; flex-direction: column;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05); min-width: 160px;
    }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-main); margin-top: 0.25rem; }
    .text-primary { color: var(--primary); }

    .content-wrapper { max-width: 1100px; margin: 4.5rem auto 0 auto; padding: 0 2rem; display: flex; flex-direction: column; gap: 2rem; }

    .card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.03); overflow: hidden; }
    .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
    .card-header h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .subtitle-hint { font-size: 0.85rem; color: var(--text-muted); display: block; margin-top: 0.25rem; }
    .card-body { padding: 1.5rem; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem; }
    
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 0.85rem; font-size: 1.1rem; opacity: 0.7; }
    .input-with-icon select, .input-with-icon input {
      width: 100%; padding: 0.75rem 0.85rem 0.75rem 2.6rem; border: 1px solid var(--border-color);
      border-radius: 6px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem; outline: none;
      transition: border-color 0.2s ease;
    }
    .input-with-icon select:focus, .input-with-icon input:focus { border-color: var(--primary); }
    .input-with-icon select:disabled, .input-with-icon input:disabled { opacity: 0.6; cursor: not-allowed; }

    .resumen-reserva { background: rgba(2, 132, 199, 0.05); border: 1px dashed var(--primary); padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .resumen-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .resumen-label { color: var(--text-main); font-weight: 600; }
    .resumen-valor { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
    .resumen-nota { margin: 0; font-size: 0.8rem; color: var(--text-muted); font-style: italic; }

    .form-actions { display: flex; justify-content: flex-end; }

    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { background-color: rgba(0,0,0,0.02); color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; padding: 1rem 1.5rem; border-bottom: 2px solid var(--border-color); white-space: nowrap; }
    .data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-main); vertical-align: middle; }
    .data-table tbody tr:hover { background-color: rgba(0,0,0,0.01); }
    
    .text-center { text-align: center; }
    .text-muted { color: var(--text-muted); }
    .small { font-size: 0.85rem; }

    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { background: rgba(0,0,0,0.05); padding: 0.4rem; border-radius: 50%; font-size: 1.2rem; line-height: 1; }
    
    .status-badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
    .status-badge.activo { background: #e0f2fe; color: #0369a1; }
    .status-badge.atendido { background: #dcfce7; color: #15803d; }
    .status-badge.ausente { background: #fef3c7; color: #b45309; }
    .status-badge.cancelado { background: #fee2e2; color: #b91c1c; }

    .btn-action-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); padding: 0.4rem 0.85rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn-action-danger:hover { background: var(--danger); color: white; }
    
    .btn-solid-primary { background: var(--primary); border: 1px solid var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
    .btn-solid-primary:hover:not(:disabled) { background: var(--primary-hover); }
    .btn-solid-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-solid-danger { background: var(--danger); border: 1px solid var(--danger); color: white; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex: 1; }
    .btn-solid-danger:hover { background: var(--danger-hover); }
    
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex: 1; }
    .btn-outline:hover { background: var(--bg-page); }

    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-box { background: var(--bg-card); padding: 2rem; border-radius: 16px; width: 90%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center; animation: modalPop 0.2s ease-out; border: 1px solid var(--border-color); }
    .modal-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .text-danger { color: var(--danger); }
    .modal-box h4 { margin: 0 0 1rem 0; color: var(--text-main); font-size: 1.3rem; }
    .modal-box p { color: var(--text-main); margin-bottom: 1rem; }
    .modal-subtext { font-size: 0.85rem !important; color: var(--text-muted) !important; }
    .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center; }

    @keyframes modalPop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    .toast-notification { position: fixed; bottom: 2rem; right: 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); z-index: 2000; }
    .toast-notification.show { transform: translateY(0); opacity: 1; }
    .toast-notification.exito { border-left: 4px solid #15803d; }
    .toast-notification.error { border-left: 4px solid #b91c1c; }
    .toast-icon { font-size: 1.5rem; }
    .toast-content { display: flex; flex-direction: column; }
    .toast-content strong { color: var(--text-main); font-size: 0.95rem; }
    .toast-content span { color: var(--text-muted); font-size: 0.85rem; }
    .toast-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 0.25rem; }
  `]
})
export class PanelPacienteComponent implements OnInit {
  medicos: Medico[] = [];
  reservas: Reserva[] = [];

  idMedicoSeleccionado: number | null = null;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  horariosDisponibles: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  arancelCongelado: number | null = null;
  estadoReserva = EstadoReserva;
  loading: boolean = false;
  minDate: string = '';
  maxDate: string = '';
  mostrarModalCancelar: boolean = false;
  idReservaACancelar: number | null = null;
  popupNotificacion = {
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: ''
  };

  private toastTimeout: any;

  constructor(
    private reservasService: ReservasService,
    private medicosService: MedicosService
  ) { }

  ngOnInit(): void {
    this.configurarLimitesFechas();
    this.cargarMedicos();
    this.cargarMisReservas();
  }

  get turnosActivos(): number {
    return this.reservas.filter(r => r.estado === this.estadoReserva.ACTIVO).length;
  }

  configurarLimitesFechas(): void {
    const hoy = new Date();
    this.minDate = this.formatearFechaISO(hoy);

    const max = new Date();
    max.setDate(hoy.getDate() + 30);
    this.maxDate = this.formatearFechaISO(max);
  }

  private formatearFechaISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cargarMedicos(): void {
    this.medicosService.listarTodos().subscribe({
      next: (data) => (this.medicos = data),
      error: () => this.mostrarPopup('Error', 'No pude cargar la lista de profesionales', 'error')
    });
  }

  cargarMisReservas(): void {
    this.reservasService.listarReservas().subscribe({
      next: (data) => (this.reservas = data),
      error: () => this.mostrarPopup('Error', 'No pude cargar tus turnos previos', 'error')
    });
  }

  onMedicoChange(): void {
    const med = this.medicos.find((m) => m.id === this.idMedicoSeleccionado);
    this.arancelCongelado = med ? med.valor_consulta : null;
  }

  generarHorarios(): void {
    const slots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    this.horaSeleccionada = '';

    if (!this.fechaSeleccionada) {
      this.horariosDisponibles = [];
      return;
    }

    if (this.fechaSeleccionada === this.minDate) {
      const horaActual = new Date().getHours();
      this.horariosDisponibles = slots.filter((slot) => {
        const horaSlot = parseInt(slot.split(':')[0], 10);
        return horaSlot > horaActual;
      });
    } else {
      this.horariosDisponibles = [...slots];
    }
  }

  onReservar(): void {
    if (!this.idMedicoSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) return;

    this.loading = true;
    const fecha_hora = `${this.fechaSeleccionada}T${this.horaSeleccionada}:00`;

    this.reservasService.crearReserva({
      id_medico: this.idMedicoSeleccionado,
      fecha_hora,
    }).subscribe({
      next: () => {
        this.loading = false;

        // Limpio todo el formulario después de reservar
        this.idMedicoSeleccionado = null;
        this.fechaSeleccionada = '';
        this.horaSeleccionada = '';
        this.arancelCongelado = null;
        this.horariosDisponibles = [];

        this.mostrarPopup('Turno Confirmado', 'Tu reserva se generó con éxito y ya congelamos el arancel.', 'exito');
        this.cargarMisReservas();
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Hubo un error al intentar reservar.';
        this.mostrarPopup('Error al Reservar', msg, 'error');
      }
    });
  }

  abrirModalCancelar(idReserva: number): void {
    this.idReservaACancelar = idReserva;
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.idReservaACancelar = null;
  }

  confirmarCancelacion(): void {
    if (!this.idReservaACancelar) return;

    const id = this.idReservaACancelar;
    this.cerrarModalCancelar();

    this.reservasService.cancelarReserva(id).subscribe({
      next: () => {
        this.mostrarPopup('Turno Cancelado', 'Cancelamos tu reserva exitosamente.', 'exito');
        this.cargarMisReservas();
      },
      error: (err) => {
        const msg = err.error?.message || 'No te puedo cancelar este turno (quizás ya venció).';
        this.mostrarPopup('Cancelación Rechazada', msg, 'error');
      }
    });
  }

  mostrarPopup(titulo: string, mensaje: string, tipo: 'exito' | 'error' = 'exito'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.popupNotificacion = { visible: true, tipo, titulo, mensaje };

    this.toastTimeout = setTimeout(() => {
      this.cerrarNotificacion();
    }, 4000);
  }

  cerrarNotificacion(): void {
    this.popupNotificacion.visible = false;
  }
}