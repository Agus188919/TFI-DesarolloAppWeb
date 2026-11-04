import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicosService } from '../../services/medicos.service';
import { ReservasService } from '../../services/reservas.service';
import { Medico, Reserva, EstadoReserva } from '../../models/types';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-container">
      
      <div class="hero-header">
        <div class="hero-content">
          <div>
            <h1 class="hero-title">Panel de Administración</h1>
            <p class="hero-subtitle">Gestión central de aranceles y monitoreo de turnos clínicos.</p>
          </div>
          <div class="hero-icon">⚙️</div>
        </div>
        
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-label">Médicos Activos</span>
            <span class="stat-value">{{ medicos.length }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Reservas</span>
            <span class="stat-value">{{ reservas.length }}</span>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <section class="card">
          <div class="card-header">
            <h3>Aranceles de Consultas Médicas</h3>
            <span class="subtitle-hint">Hacé clic en el lápiz para actualizar el valor.</span>
          </div>
          
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Matrícula</th>
                  <th class="col-arancel">Arancel Actual</th>
                  <th class="col-actions">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of medicos">
                  <td>
                    <div class="user-info">
                      <span class="avatar">👨‍⚕️</span>
                      <strong>Dr. {{ m.usuario.nombres }} {{ m.usuario.apellidos }}</strong>
                    </div>
                  </td>
                  <td><span class="text-muted">{{ m.matricula }}</span></td>
                  <td class="col-arancel">
                    <span *ngIf="editandoId !== m.id" class="arancel-badge">
                      $ {{ m.valor_consulta | number:'1.0-0' }}
                    </span>
                    <div *ngIf="editandoId === m.id" class="edit-input-group">
                      <span class="currency-symbol">$</span>
                      <input 
                        type="number" 
                        [(ngModel)]="nuevoValorTemp" 
                        min="1"
                        class="input-arancel"
                        (keyup.enter)="abrirModalActualizarArancel(m)"
                      />
                    </div>
                  </td>
                  <td class="col-actions">
                    <button *ngIf="editandoId !== m.id" class="btn-icon btn-edit" (click)="iniciarEdicion(m)" title="Editar Arancel">
                      ✏️
                    </button>
                    <div *ngIf="editandoId === m.id" class="action-buttons-group">
                      <button class="btn-icon btn-confirm" (click)="abrirModalActualizarArancel(m)" title="Guardar">✓</button>
                      <button class="btn-icon btn-cancel-edit" (click)="cancelarEdicion()" title="Cancelar">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h3>Todas las Reservas de la Clínica</h3>
          </div>
          
          <div class="table-responsive" *ngIf="reservas.length > 0; else sinReservas">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-id">ID</th>
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Arancel Congelado</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of reservas">
                  <td class="col-id"><span class="id-badge">#{{ r.id }}</span></td>
                  <td class="col-fecha">
                    <strong>{{ r.fecha_hora | date:'dd/MM/yyyy' }}</strong><br>
                    <span class="text-muted">{{ r.fecha_hora | date:'HH:mm' }} hs</span>
                  </td>
                  <td>
                    <div class="stack-text">
                      <strong>{{ r.paciente?.nombres }} {{ r.paciente?.apellidos }}</strong>
                      <span class="text-muted small">DNI: {{ r.paciente?.documento }}</span>
                    </div>
                  </td>
                  <td>Dr. {{ r.medico?.usuario?.nombres }} {{ r.medico?.usuario?.apellidos }}</td>
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
                      Cancelar Turno
                    </button>
                    <span *ngIf="r.estado !== estadoReserva.ACTIVO" class="text-muted small">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #sinReservas>
            <div class="empty-state">
              <span class="empty-icon">📅</span>
              <p>No hay reservas registradas en el sistema en este momento.</p>
            </div>
          </ng-template>
        </section>
      </div>

      <div class="modal-backdrop" *ngIf="modalArancel.visible">
        <div class="modal-box">
          <div class="modal-icon text-primary">💰</div>
          <h4>Confirmar Nuevo Arancel</h4>
          <p>
            ¿Actualizar el valor de consulta para el<br>
            <b>Dr. {{ modalArancel.medico?.usuario?.nombres }} {{ modalArancel.medico?.usuario?.apellidos }}</b>?
          </p>
          <div class="highlight-box">
            Nuevo monto: <strong>$ {{ modalArancel.monto | number:'1.0-0' }}</strong>
          </div>
          <p class="modal-subtext">Las reservas previas conservarán su valor original.</p>
          
          <div class="modal-actions">
            <button class="btn-outline" (click)="cerrarModalArancel()">Cancelar</button>
            <button class="btn-solid-primary" (click)="confirmarActualizarArancel()">Confirmar Cambio</button>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="modalCancelar.visible">
        <div class="modal-box">
          <div class="modal-icon text-danger">⚠️</div>
          <h4>Confirmar Cancelación</h4>
          <p>¿Está seguro de que desea cancelar el turno <b>#{{ modalCancelar.idReserva }}</b>?</p>
          <p class="modal-subtext">Esta acción es irreversible y liberará el horario del médico.</p>
          
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
      --primary: #0284c7;
      --primary-hover: #0369a1;
      --danger: #ef4444;
      --danger-hover: #dc2626;
      
      --hero-bg-1: #0ea5e9;
      --hero-bg-2: #0369a1;
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
      --primary: #38bdf8;
      --primary-hover: #0284c7;
      
      --hero-bg-1: #0c4a6e;
      --hero-bg-2: #082f49;
    }

    .panel-container {
      font-family: inherit;
      padding-bottom: 3rem;
    }

    .hero-header {
      background: linear-gradient(135deg, var(--hero-bg-1), var(--hero-bg-2));
      padding: 3rem 2rem 5rem 2rem;
      color: var(--hero-text);
      position: relative;
    }
    .hero-content {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hero-title { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
    .hero-subtitle { margin: 0.5rem 0 0 0; font-size: 1.1rem; opacity: 0.9; }
    .hero-icon { font-size: 4rem; opacity: 0.2; }

    .stats-row {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      gap: 1.5rem;
      position: absolute;
      bottom: -2.5rem;
      left: 0;
      right: 0;
      padding: 0 2rem;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      min-width: 160px;
    }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-main); margin-top: 0.25rem; }

    .content-wrapper {
      max-width: 1100px;
      margin: 4.5rem auto 0 auto;
      padding: 0 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .card {
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      overflow: hidden;
    }
    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .card-header h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .subtitle-hint { font-size: 0.85rem; color: var(--text-muted); display: block; margin-top: 0.25rem; }

    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { 
      background-color: rgba(0,0,0,0.02); 
      color: var(--text-muted); 
      font-size: 0.85rem; 
      text-transform: uppercase; 
      padding: 1rem 1.5rem; 
      border-bottom: 2px solid var(--border-color);
      white-space: nowrap;
    }
    .data-table td { 
      padding: 1.25rem 1.5rem; 
      border-bottom: 1px solid var(--border-color);
      color: var(--text-main);
      vertical-align: middle;
    }
    .data-table tbody tr:hover { background-color: rgba(0,0,0,0.01); }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-muted); }
    .small { font-size: 0.85rem; }

    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { background: rgba(0,0,0,0.05); padding: 0.4rem; border-radius: 50%; font-size: 1.2rem; line-height: 1; }
    .id-badge { background: var(--border-color); padding: 0.25rem 0.5rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }
    .stack-text { display: flex; flex-direction: column; gap: 0.15rem; }
    
    .status-badge { 
      display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px;
    }
    .status-badge.activo { background: #e0f2fe; color: #0369a1; }
    .status-badge.atendido { background: #dcfce7; color: #15803d; }
    .status-badge.ausente { background: #fef3c7; color: #b45309; }
    .status-badge.cancelado { background: #fee2e2; color: #b91c1c; }

    .col-arancel { width: 180px; }
    .col-actions { width: 100px; text-align: center; }
    .arancel-badge { font-weight: 700; font-size: 1.05rem; }
    
    .edit-input-group {
      display: flex; align-items: center; background: var(--bg-page); border: 1px solid var(--primary); border-radius: 6px; padding: 0.35rem 0.5rem;
    }
    .currency-symbol { color: var(--text-muted); font-weight: bold; margin-right: 0.25rem; }
    .input-arancel {
      border: none; background: transparent; color: var(--text-main); font-weight: 700; font-size: 1rem; width: 100px; outline: none;
    }
    
    .btn-icon {
      background: transparent; border: none; font-size: 1.1rem; cursor: pointer; padding: 0.4rem; border-radius: 6px; transition: all 0.2s;
    }
    .btn-edit { color: var(--text-muted); }
    .btn-edit:hover { background: var(--border-color); color: var(--text-main); }
    
    .action-buttons-group { display: flex; gap: 0.25rem; justify-content: center; }
    .btn-confirm { background: #dcfce7; color: #15803d; }
    .btn-confirm:hover { background: #bbf7d0; }
    .btn-cancel-edit { background: #fee2e2; color: #b91c1c; }
    .btn-cancel-edit:hover { background: #fecaca; }

    .btn-action-danger {
      background: transparent; color: var(--danger); border: 1px solid var(--danger); padding: 0.4rem 0.85rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;
    }
    .btn-action-danger:hover { background: var(--danger); color: white; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5; }

    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; z-index: 1000;
    }
    .modal-box {
      background: var(--bg-card); padding: 2rem; border-radius: 16px; width: 90%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center; animation: modalPop 0.2s ease-out; border: 1px solid var(--border-color);
    }
    .modal-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .text-primary { color: var(--primary); }
    .text-danger { color: var(--danger); }
    .modal-box h4 { margin: 0 0 1rem 0; color: var(--text-main); font-size: 1.3rem; }
    .modal-box p { color: var(--text-main); margin-bottom: 1rem; }
    .highlight-box { background: var(--bg-page); border: 1px dashed var(--border-color); padding: 1rem; border-radius: 8px; font-size: 1.2rem; color: var(--primary); margin-bottom: 1rem; }
    .modal-subtext { font-size: 0.85rem !important; color: var(--text-muted) !important; }
    
    .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center; }
    .modal-actions button { flex: 1; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); }
    .btn-outline:hover { background: var(--bg-page); }
    .btn-solid-primary { background: var(--primary); border: 1px solid var(--primary); color: white; }
    .btn-solid-primary:hover { background: var(--primary-hover); }
    .btn-solid-danger { background: var(--danger); border: 1px solid var(--danger); color: white; }
    .btn-solid-danger:hover { background: var(--danger-hover); }

    @keyframes modalPop {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .toast-notification {
      position: fixed; bottom: 2rem; right: 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); z-index: 2000;
    }
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
export class PanelAdminComponent implements OnInit {
  medicos: Medico[] = [];
  reservas: Reserva[] = [];
  estadoReserva = EstadoReserva;

  editandoId: number | null = null;
  nuevoValorTemp: number = 0;

  modalArancel = {
    visible: false,
    medico: null as Medico | null,
    monto: 0
  };

  modalCancelar = {
    visible: false,
    idReserva: null as number | null
  };

  popupNotificacion = {
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: ''
  };

  private toastTimeout: any;

  constructor(
    private medicosService: MedicosService,
    private reservasService: ReservasService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.medicosService.listarTodos().subscribe({
      next: (data) => (this.medicos = data),
      error: (err) => console.error(err)
    });
    this.reservasService.listarReservas().subscribe({
      next: (data) => (this.reservas = data),
      error: (err) => console.error(err)
    });
  }

  iniciarEdicion(medico: Medico): void {
    this.editandoId = medico.id;
    this.nuevoValorTemp = medico.valor_consulta;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.nuevoValorTemp = 0;
  }

  abrirModalActualizarArancel(medico: Medico): void {
    if (!this.nuevoValorTemp || this.nuevoValorTemp <= 0) {
      this.mostrarPopup('Monto Inválido', 'Debe ingresar un monto numérico mayor a 0.', 'error');
      return;
    }

    if (this.nuevoValorTemp === medico.valor_consulta) {
      this.cancelarEdicion();
      return;
    }

    this.modalArancel = {
      visible: true,
      medico,
      monto: this.nuevoValorTemp
    };
  }

  cerrarModalArancel(): void {
    this.modalArancel.visible = false;
    this.modalArancel.medico = null;
    this.modalArancel.monto = 0;
  }

  confirmarActualizarArancel(): void {
    const medico = this.modalArancel.medico;
    const monto = this.modalArancel.monto;
    if (!medico) return;

    this.cerrarModalArancel();

    this.medicosService.actualizarArancel(medico.id, monto).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.mostrarPopup('Arancel Actualizado', `El valor de consulta del Dr. ${medico.usuario.apellidos} fue actualizado a $${monto}.`, 'exito');
        this.cargarDatos();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al actualizar el arancel del médico.';
        this.mostrarPopup('Error al Actualizar', msg, 'error');
      }
    });
  }

  abrirModalCancelar(idReserva: number): void {
    this.modalCancelar = { visible: true, idReserva };
  }

  cerrarModalCancelar(): void {
    this.modalCancelar.visible = false;
    this.modalCancelar.idReserva = null;
  }

  confirmarCancelacion(): void {
    const id = this.modalCancelar.idReserva;
    if (!id) return;

    this.cerrarModalCancelar();

    this.reservasService.cancelarReserva(id).subscribe({
      next: () => {
        this.mostrarPopup('Turno Cancelado', `La reserva #${id} fue cancelada exitosamente.`, 'exito');
        this.cargarDatos();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al cancelar la reserva.';
        this.mostrarPopup('Error al Cancelar', msg, 'error');
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