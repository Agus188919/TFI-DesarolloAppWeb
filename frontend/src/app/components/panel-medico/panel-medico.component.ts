// frontend/src/app/components/panel-medico/panel-medico.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicosService } from '../../services/medicos.service';
import { Reserva, EstadoReserva } from '../../models/types';

@Component({
  selector: 'app-panel-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-container">
      
      <div class="hero-header">
        <div class="hero-content">
          <div>
            <h1 class="hero-title">Agenda Médica</h1>
            <p class="hero-subtitle">Gestión diaria de pacientes y registro de consultas.</p>
          </div>
          <div class="hero-icon">🩺</div>
        </div>
        
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-label">Total Turnos Hoy</span>
            <span class="stat-value text-primary">{{ agenda.length }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Pacientes Pendientes</span>
            <span class="stat-value">{{ turnosPendientes }}</span>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <section class="card">
          <div class="card-header">
            <h3>Consultas Programadas</h3>
            <span class="subtitle-hint">Filtrá por fecha para revisar el cronograma de trabajo.</span>
          </div>
          
          <div class="card-body">
            <div class="filter-row">
              <label>Seleccionar Fecha:</label>
              <div class="input-with-icon">
                <span class="input-icon">📅</span>
                <input type="date" [(ngModel)]="fechaConsulta" (change)="cargarAgenda()" />
              </div>
            </div>

            <div class="table-responsive" *ngIf="agenda.length > 0; else sinTurnos">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Horario</th>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th class="col-arancel">Arancel</th>
                    <th class="text-center">Estado</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of agenda">
                    <td class="hora-cell">
                      <strong>{{ t.fecha_hora | date:'HH:mm' }} hs</strong>
                    </td>
                    <td>
                      <div class="user-info">
                        <span class="avatar">👤</span>
                        <strong>{{ t.paciente?.nombres }} {{ t.paciente?.apellidos }}</strong>
                      </div>
                    </td>
                    <td><span class="text-muted">{{ t.paciente?.documento }}</span></td>
                    <td class="col-arancel"><strong>$ {{ t.valor_consulta | number:'1.0-0' }}</strong></td>
                    <td class="text-center">
                      <span class="status-badge" [ngClass]="t.estado.toLowerCase()">{{ t.estado }}</span>
                    </td>
                    <td class="text-center">
                      
                      <div *ngIf="t.estado === estadoReserva.ACTIVO" class="btn-group-center">
                        <button 
                          class="btn-action btn-atendido" 
                          title="Marcar como atendido"
                          (click)="abrirModalConfirmacion(t, estadoReserva.ATENDIDO)">
                          ✓ Atendido
                        </button>
                        <button 
                          class="btn-action btn-ausente" 
                          title="Marcar como ausente"
                          (click)="abrirModalConfirmacion(t, estadoReserva.AUSENTE)">
                          ✕ Ausente
                        </button>
                      </div>

                      <div *ngIf="t.estado === estadoReserva.ATENDIDO || t.estado === estadoReserva.AUSENTE" class="btn-group-center">
                        <button 
                          class="btn-icon-edit" 
                          title="Modificar estado del turno"
                          (click)="abrirModalEdicion(t)">
                          ✏️ <span class="edit-text">Modificar</span>
                        </button>
                      </div>

                      <span *ngIf="t.estado === estadoReserva.CANCELADO" class="text-muted small">
                        Sin acciones
                      </span>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #sinTurnos>
              <div class="empty-state">
                <span class="empty-icon">☕</span>
                <p>No se registran turnos asignados para la fecha seleccionada.</p>
              </div>
            </ng-template>
          </div>
        </section>
      </div>

      <div class="modal-backdrop" *ngIf="modalConfirmacion.visible">
        <div class="modal-box">
          <div class="modal-icon text-primary">📝</div>
          <h4>Confirmar Registro</h4>
          <p>
            ¿Confirmar el turno de las <b>{{ modalConfirmacion.turno?.fecha_hora | date:'HH:mm' }} hs</b> 
            del paciente <b>{{ modalConfirmacion.turno?.paciente?.nombres }} {{ modalConfirmacion.turno?.paciente?.apellidos }}</b> como:
          </p>
          <div class="modal-highlight" [ngClass]="modalConfirmacion.nuevoEstado?.toLowerCase()">
            {{ modalConfirmacion.nuevoEstado }}
          </div>
          <div class="modal-actions">
            <button class="btn-outline" (click)="cerrarModalConfirmacion()">Volver</button>
            <button 
              [ngClass]="modalConfirmacion.nuevoEstado === estadoReserva.ATENDIDO ? 'btn-solid-atendido' : 'btn-solid-ausente'"
              (click)="ejecutarCambioEstado(modalConfirmacion.nuevoEstado!)">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="modalEdicion.visible">
        <div class="modal-box">
          <div class="modal-icon text-muted">✏️</div>
          <h4>Modificar Estado de la Consulta</h4>
          <p>
            Paciente: <b>{{ modalEdicion.turno?.paciente?.nombres }} {{ modalEdicion.turno?.paciente?.apellidos }}</b><br>
            <span class="text-muted">Horario: {{ modalEdicion.turno?.fecha_hora | date:'HH:mm' }} hs</span>
          </p>
          <p class="modal-subtext">Seleccioná el estado correcto para rectificar el registro en el sistema:</p>
          
          <div class="edit-options">
            <button 
              class="btn-option-solid btn-opt-atendido-solid" 
              [class.activo-seleccionado]="modalEdicion.turno?.estado === estadoReserva.ATENDIDO"
              (click)="ejecutarCambioEstadoDesdeEdicion(estadoReserva.ATENDIDO)">
              <span class="opt-icon">✓</span>
              <span class="opt-text">Marcar como ATENDIDO</span>
              <span *ngIf="modalEdicion.turno?.estado === estadoReserva.ATENDIDO" class="opt-tag">(Actual)</span>
            </button>

            <button 
              class="btn-option-solid btn-opt-ausente-solid" 
              [class.activo-seleccionado]="modalEdicion.turno?.estado === estadoReserva.AUSENTE"
              (click)="ejecutarCambioEstadoDesdeEdicion(estadoReserva.AUSENTE)">
              <span class="opt-icon">✕</span>
              <span class="opt-text">Marcar como AUSENTE</span>
              <span *ngIf="modalEdicion.turno?.estado === estadoReserva.AUSENTE" class="opt-tag">(Actual)</span>
            </button>
          </div>

          <div class="modal-actions" style="margin-top: 1.5rem;">
            <button class="btn-outline w-100" (click)="cerrarModalEdicion()">Cerrar</button>
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
      --primary: #4f46e5;      /* Indigo para el Médico */
      --primary-hover: #4338ca;
      --atendido: #16a34a;
      --ausente: #ea580c;
      
      --hero-bg-1: #4f46e5;
      --hero-bg-2: #312e81;
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
      --primary: #6366f1;
      
      --hero-bg-1: #3730a3;
      --hero-bg-2: #1e1b4b;
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

    /* Mis Estadísticas Flotantes */
    .stats-row {
      max-width: 1100px; margin: 0 auto; display: flex; gap: 1.5rem; position: absolute;
      bottom: -2.5rem; left: 0; right: 0; padding: 0 2rem;
      /* Aseguro que en mobile se pueda scrollear o acomodar */
      overflow-x: auto;
    }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px;
      padding: 1rem 1.5rem; display: flex; flex-direction: column;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05); min-width: 160px;
    }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-main); margin-top: 0.25rem; }
    .text-primary { color: var(--primary); }

    /* Contenedor Principal (lo muevo hacia abajo para dar espacio a las tarjetitas) */
    .content-wrapper { max-width: 1100px; margin: 4.5rem auto 0 auto; padding: 0 2rem; display: flex; flex-direction: column; gap: 2rem; }

    .card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.03); overflow: hidden; }
    .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
    .card-header h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .subtitle-hint { font-size: 0.85rem; color: var(--text-muted); display: block; margin-top: 0.25rem; }
    .card-body { padding: 1.5rem; }

    /* Mi Filtro de Fecha (Acomodado para que luzca bien en mobile) */
    .filter-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filter-row label { font-weight: 600; color: var(--text-main); font-size: 0.95rem; }
    
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 0.85rem; font-size: 1.1rem; opacity: 0.7; }
    .input-with-icon input {
      width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1px solid var(--border-color);
      border-radius: 6px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem; outline: none;
      transition: border-color 0.2s ease;
    }
    .input-with-icon input:focus { border-color: var(--primary); }

    /* Tabla con Scroll para Mobile */
    .table-responsive { overflow-x: auto; margin-bottom: 1rem; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { background-color: rgba(0,0,0,0.02); color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; padding: 1rem 1.5rem; border-bottom: 2px solid var(--border-color); white-space: nowrap; }
    .data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-main); vertical-align: middle; }
    .data-table tbody tr:hover { background-color: rgba(0,0,0,0.01); }
    
    .text-center { text-align: center; }
    .text-muted { color: var(--text-muted); }
    .small { font-size: 0.85rem; }
    .col-arancel { width: 120px; }
    
    .user-info { display: flex; align-items: center; gap: 0.75rem; white-space: nowrap; }
    .avatar { background: rgba(0,0,0,0.05); padding: 0.3rem 0.4rem; border-radius: 50%; font-size: 1.1rem; line-height: 1; }
    
    /* Mis Badges de Estado */
    .status-badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
    .status-badge.activo { background: #e0f2fe; color: #0369a1; }
    .status-badge.atendido { background: #dcfce7; color: #15803d; }
    .status-badge.ausente { background: #ffedd5; color: #c2410c; }
    .status-badge.cancelado { background: #fee2e2; color: #b91c1c; }

    /* Botones de Acción Inline de la Tabla */
    .btn-group-center { display: flex; gap: 0.5rem; justify-content: center; align-items: center; flex-wrap: wrap; }
    .btn-action { border: none; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: background 0.15s; color: white; white-space: nowrap; }
    .btn-atendido { background: var(--atendido); }
    .btn-atendido:hover { background: #15803d; }
    .btn-ausente { background: var(--ausente); }
    .btn-ausente:hover { background: #c2410c; }
    
    .btn-icon-edit {
      display: inline-flex; align-items: center; gap: 0.35rem; background: var(--bg-page);
      border: 1px solid var(--border-color); padding: 0.35rem 0.75rem; border-radius: 6px;
      cursor: pointer; font-size: 0.85rem; color: var(--text-main); transition: all 0.2s; white-space: nowrap;
    }
    .btn-icon-edit:hover { background: var(--border-color); }
    .edit-text { font-size: 0.8rem; font-weight: 600; }

    /* Empty State */
    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5; }

    /* Mis Modales Adaptables */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; box-sizing: border-box; }
    .modal-box { background: var(--bg-card); padding: 2rem; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center; animation: modalPop 0.2s ease-out; border: 1px solid var(--border-color); }
    .modal-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .modal-box h4 { margin: 0 0 1rem 0; color: var(--text-main); font-size: 1.3rem; }
    .modal-box p { color: var(--text-main); margin-bottom: 1rem; }
    .modal-subtext { font-size: 0.85rem !important; color: var(--text-muted) !important; }
    
    /* El banner de confirmación */
    .modal-highlight { font-size: 1.1rem; font-weight: 700; text-align: center; margin: 1rem 0; padding: 0.75rem; border-radius: 6px; }
    .modal-highlight.atendido { background: #dcfce7; color: #15803d; border: 1px dashed #15803d; }
    .modal-highlight.ausente { background: #ffedd5; color: #c2410c; border: 1px dashed #c2410c; }
    
    .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center; flex-wrap: wrap; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex: 1; min-width: 100px; }
    .btn-outline:hover { background: var(--bg-page); }
    .w-100 { width: 100%; flex: unset !important; }
    
    .btn-solid-atendido { background: var(--atendido); border: 1px solid var(--atendido); color: white; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex: 1; min-width: 100px; }
    .btn-solid-atendido:hover { background: #15803d; }
    .btn-solid-ausente { background: var(--ausente); border: 1px solid var(--ausente); color: white; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex: 1; min-width: 100px; }
    .btn-solid-ausente:hover { background: #c2410c; }

    /* Botones gruesos dentro del modal de Edición (Rectificación) */
    .edit-options { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.25rem; }
    .btn-option-solid {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.2rem; border-radius: 8px; border: none; color: white;
      font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease-in-out;
    }
    .btn-opt-atendido-solid { background: var(--atendido); }
    .btn-opt-atendido-solid:hover { background: #15803d; }
    .btn-opt-ausente-solid { background: var(--ausente); }
    .btn-opt-ausente-solid:hover { background: #c2410c; }
    .btn-option-solid.activo-seleccionado { outline: 3px solid var(--text-main); outline-offset: 2px; }
    
    .opt-icon { font-size: 1.1rem; margin-right: 0.5rem; }
    .opt-text { flex: 1; text-align: left; }
    .opt-tag { font-size: 0.75rem; background: rgba(0,0,0,0.25); padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; }

    @keyframes modalPop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    /* Mis Notificaciones (Toasts) */
    .toast-notification { position: fixed; bottom: 2rem; right: 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); z-index: 2000; }
    .toast-notification.show { transform: translateY(0); opacity: 1; }
    .toast-notification.exito { border-left: 4px solid #15803d; }
    .toast-notification.error { border-left: 4px solid #b91c1c; }
    .toast-icon { font-size: 1.5rem; }
    .toast-content { display: flex; flex-direction: column; }
    .toast-content strong { color: var(--text-main); font-size: 0.95rem; }
    .toast-content span { color: var(--text-muted); font-size: 0.85rem; }
    .toast-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 0.25rem; }
    
    /* Media queries extra para asegurar que se vea de 10 en celulares chicos */
    @media (max-width: 600px) {
      .content-wrapper { padding: 0 1rem; margin-top: 5rem; }
      .hero-header { padding: 2rem 1.5rem 4rem 1.5rem; }
      .stats-row { padding: 0 1rem; }
      .card-body { padding: 1rem; }
      .toast-notification { right: 1rem; left: 1rem; bottom: 1rem; }
    }
  `]
})
export class PanelMedicoComponent implements OnInit {
  fechaConsulta: string = '';
  agenda: Reserva[] = [];
  estadoReserva = EstadoReserva;

  // Me armo esta estructura para manejar el modal cuando toco los botones iniciales (Atendido/Ausente)
  modalConfirmacion = {
    visible: false,
    turno: null as Reserva | null,
    nuevoEstado: null as EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE | null
  };

  // Esta otra estructura es para el modal de rectificación (el del lápiz)
  modalEdicion = {
    visible: false,
    turno: null as Reserva | null
  };

  // Mi objeto para los Toasts flotantes
  popupNotificacion = {
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: ''
  };

  private toastTimeout: any;

  constructor(private medicosService: MedicosService) { }

  ngOnInit(): void {
    // Seteo la fecha de hoy por defecto apenas entra el médico
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    this.fechaConsulta = `${y}-${m}-${d}`;

    this.cargarAgenda();
  }

  // Getter para que el hero-header calcule dinámicamente los turnos que faltan atender
  get turnosPendientes(): number {
    return this.agenda.filter(t => t.estado === this.estadoReserva.ACTIVO).length;
  }

  cargarAgenda(): void {
    if (!this.fechaConsulta) return;
    this.medicosService.listarAgenda(this.fechaConsulta).subscribe({
      next: (data) => (this.agenda = data),
      error: () => this.mostrarToast('Error', 'No pude cargar la agenda de hoy', 'error')
    });
  }

  // Abre el primer modal para confirmar antes de cambiar el estado de un turno pendiente
  abrirModalConfirmacion(turno: Reserva, nuevoEstado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE): void {
    this.modalConfirmacion = {
      visible: true,
      turno,
      nuevoEstado
    };
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmacion = { visible: false, turno: null, nuevoEstado: null };
  }

  // Abre el modal grueso si el médico necesita corregir un turno que ya marcó
  abrirModalEdicion(turno: Reserva): void {
    this.modalEdicion = {
      visible: true,
      turno
    };
  }

  cerrarModalEdicion(): void {
    this.modalEdicion = { visible: false, turno: null };
  }

  // Llama al backend confirmando el cambio desde el primer modal
  ejecutarCambioEstado(nuevoEstado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE): void {
    const turno = this.modalConfirmacion.turno;
    if (!turno) return;

    this.cerrarModalConfirmacion();
    this.actualizarEstadoEnBackend(turno.id, nuevoEstado);
  }

  // Llama al backend confirmando el cambio desde el modal del lápiz
  ejecutarCambioEstadoDesdeEdicion(nuevoEstado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE): void {
    const turno = this.modalEdicion.turno;
    if (!turno) return;

    // Si toca el mismo estado que ya tiene, no hago nada y cierro
    if (turno.estado === nuevoEstado) {
      this.cerrarModalEdicion();
      return;
    }

    this.cerrarModalEdicion();
    this.actualizarEstadoEnBackend(turno.id, nuevoEstado);
  }

  // Función privada centralizada donde hablo con el servicio
  private actualizarEstadoEnBackend(idTurno: number, nuevoEstado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE): void {
    this.medicosService.actualizarEstadoTurno(idTurno, nuevoEstado).subscribe({
      next: () => {
        this.mostrarToast('Registro Actualizado', 'El estado del paciente se guardó correctamente.', 'exito');
        this.cargarAgenda(); // Refresco los turnos
      },
      error: (err) => {
        const msg = err.error?.message || 'Hubo un error al actualizar el estado del turno.';
        this.mostrarToast('Operación denegada', msg, 'error');
      }
    });
  }

  // Mi lógica para manejar los Toasts
  mostrarToast(titulo: string, mensaje: string, tipo: 'exito' | 'error' = 'exito'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.popupNotificacion = { visible: true, tipo, titulo, mensaje };

    // Auto-cierre del toast a los 4 segundos
    this.toastTimeout = setTimeout(() => {
      this.cerrarNotificacion();
    }, 4000);
  }

  cerrarNotificacion(): void {
    this.popupNotificacion.visible = false;
  }
}