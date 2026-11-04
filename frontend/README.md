# Portal Clínico - Sistema de Gestión de Turnos y Consultas

Aplicación web desarrollada como Trabajo Final Integrador (TFI) para la gestión integral de turnos médicos, congelamiento de aranceles y administración de consultas en tiempo real.

---

## 🚀 Tecnologías y Herramientas

- **Framework:** [Angular](https://angular.dev/) (Standalone Components, Reactive & Template-driven Forms)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** CSS3 nativo con Variables CSS (Diseño responsivo y temas dinámicos)
- **Testing:** [Vitest](https://vitest.dev/)
- **Gestor de Paquetes:** npm

---

## ✨ Características Principales

- **Arquitectura Basada en Roles:** Flujos y accesos independientes para Administrador, Médico y Paciente.
- **Soporte de Tema Oscuro (Dark Mode):** Alternancia entre modo claro y oscuro persistente en `localStorage`.
- **Política de Arancel Congelado:** Los turnos emitidos conservan inalterado el valor monetario de la consulta vigente al momento de su reserva.
- **Acordeón de Credenciales Rápidas:** Selector integrado en el Login con precarga asistida para evaluación y testing.
- **Edición en Línea de Aranceles:** Gestión ágil de honorarios médicos desde el panel de administración.
- **Diseño 100% Responsivo:** Interfaz adaptable a dispositivos móviles y escritorios.

---

## 👥 Credenciales de Prueba (Seeds)

| Rol | Usuario | Identificador (DNI) | Email | Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | Florencia Agustina Mammana | `10000001` | `admin@clinica.com` | `Password123!` |
| **Médico Clínico** | Dr. Marco Ruben | `11111111` | `ruben@clinica.com` | `Password123!` |
| **Médico Clínico** | Dr. Ángel Di María | `22222222` | `dimaria@clinica.com` | `Password123!` |
| **Médico Clínico** | Dr. Omar Palma | `33333333` | `palma@clinica.com` | `Password123!` |
| **Médico Clínico** | Dr. Mario Kempes | `44444444` | `kempes@clinica.com` | `Password123!` |
| **Médico Clínico** | Dr. Edgardo Bauza | `55555555` | `bauza@clinica.com` | `Password123!` |
| **Paciente** | Aldo Poy | `66666666` | `poy@clinica.com` | `Password123!` |
| **Paciente** | Jorge Broun | `77777777` | `broun@clinica.com` | `Password123!` |
| **Paciente** | Jaminton Campaz | `88888888` | `campaz@clinica.com` | `Password123!` |
| **Paciente (Baja)** | Usuario Inactivo | `99990000` | `inactivo@clinica.com` | `Password123!` *(Login denegado)* |

---

## 📋 Reglas de Negocio Implementadas

1. **Autenticación e Ingreso:** Se permite iniciar sesión tanto con Documento (DNI) como con correo electrónico institucional/personal.
2. **Reserva de Turnos (Paciente):**
   - Rango de anticipación: Desde la fecha actual hasta 30 días posteriores.
   - Franjas horarias: Bloques de 1 hora entre las 08:00 y las 16:00 hs.
   - Si la reserva es para el día en curso, los horarios pasados se deshabilitan automáticamente.
3. **Cancelaciones:**
   - **Administrador:** Puede cancelar cualquier reserva activa hasta el momento exacto de inicio de la consulta.
   - **Paciente:** Solo puede cancelar turnos futuros (hasta las 23:59 hs del día anterior a la cita).
4. **Atención Médica (Médico):**
   - El profesional registra la concurrencia (`ATENDIDO` o `AUSENTE`).
   - Dispone de rectificación en cualquier momento mediante el botón de edición.

---

## 🛠️ Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js (versión 20 o superior recomendada)
- Backend y base de datos PostgreSQL en ejecución

### Pasos
1. Clonar el repositorio y ubicarse en el directorio del frontend:
   ```bash
   cd frontend