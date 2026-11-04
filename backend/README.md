# 🏥 Sistema de Gestión de Turnos Médicos - TFI 2026

Sistema web integral full-stack para la gestión clínica de turnos médicos particulares, desarrollado con una arquitectura orientada a servicios, desacoplamiento frontend/backend, persistencia relacional y despliegue sobre Nginx y PM2.

---

## 🚀 Tecnologías Utilizadas

El proyecto cumple de forma estricta con el stack tecnológico obligatorio:

* **Backend:** [NestJS](https://nestjs.com/) (TypeScript)
* **ORM:** [TypeORM](https://typeorm.io/)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
* **Frontend:** [Angular](https://angular.dev/) (Standalone Components, Reactive Data Flow)
* **Servidor Web & Reverse Proxy:** [Nginx](https://nginx.org/)
* **Gestor de Procesos:** [PM2](https://pm2.keymetrics.io/)
* **Documentación de API:** [Swagger / OpenAPI](https://swagger.io/)
* **Documentación de Arquitectura Frontend:** [Compodoc](https://compodoc.app/)

---

## 📋 Reglas de Negocio Implementadas

1. **Horarios de Atención:** La clínica atiende de 08:00 a 16:00 hs. Cada turno tiene una duración fija de exactamente 1 hora (slots: 08:00, 09:00, ..., 15:00 hs).
2. **Horizonte de Reserva:** Las reservas solo se pueden realizar con un anticipo máximo de 30 días corridos.
3. **Disponibilidad:** No se permite solapar turnos en un mismo horario para un mismo profesional.
4. **Congelamiento de Aranceles:** Al momento de confirmar una reserva, se congela el valor de la consulta médica correspondiente, manteniéndose inalterado ante futuras variaciones de precios.
5. **Políticas de Cancelación:**
   * **Pacientes:** Solo pueden cancelar turnos hasta el día previo a la consulta (no permitido durante la jornada del turno).
   * **Administradores:** Pueden cancelar turnos hasta el instante exacto en que inicia la consulta.
6. **Agenda Médica:** Los médicos solo visualizan su propia agenda para una fecha seleccionada y registran las consultas como `ATENDIDO` o `AUSENTE` (con opción de rectificación).
7. **Autenticación y Seguridad:** Solo pueden iniciar sesión usuarios activos. Las contraseñas están hasheadas con `bcrypt` y las sesiones protegidas con tokens JWT.

---

## 👥 Roles y Credenciales de Demostración

Todos los usuarios de prueba comparten la clave de acceso unificada: `Password123!`

### Administrador
| Usuario | Identificador (DNI) | Email | Clave | Rol |
| :--- | :--- | :--- | :--- | :--- |
| Administrador General | `10000001` | `admin@clinica.com` | `Password123!` | `ADMINISTRADOR` |

### Médicos Clínicos
| Médico | DNI | Matrícula | Arancel Inicial | Email | Clave |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Dr. Marco Ruben | `11111111` | `100001` | $ 25.000 | `ruben@clinica.com` | `Password123!` |
| Dr. Ángel Di María | `22222222` | `100002` | $ 28.000 | `dimaria@clinica.com` | `Password123!` |
| Dr. Omar Palma | `33333333` | `100003` | $ 22.000 | `palma@clinica.com` | `Password123!` |
| Dr. Mario Kempes | `44444444` | `100004` | $ 30.000 | `kempes@clinica.com` | `Password123!` |
| Dr. Edgardo Bauza | `55555555` | `100005` | $ 24.000 | `bauza@clinica.com` | `Password123!` |

### Pacientes
| Paciente | DNI (Login) | Email | Clave | Estado |
| :--- | :--- | :--- | :--- | :--- |
| Aldo Poy | `66666666` | `poy@clinica.com` | `Password123!` | `ACTIVO` |
| Jorge Broun | `77777777` | `broun@clinica.com` | `Password123!` | `ACTIVO` |
| Jaminton Campaz | `88888888` | `campaz@clinica.com` | `Password123!` | `ACTIVO` |
| Ignacio Malcorra | `99999999` | `malcorra@clinica.com` | `Password123!` | `ACTIVO` |
| César Delgado | `12345678` | `delgado@clinica.com` | `Password123!` | `ACTIVO` |
| Usuario Inactivo | `99990000` | `inactivo@clinica.com` | `Password123!` | `BAJA` *(Rechazo de login)* |

---

## 🛠️ Instalación y Configuración del Entorno

### 1. Variables de Entorno (Backend)
Crear un archivo `.env` en la raíz de la carpeta `backend/`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=clinica_db
JWT_SECRET=clave_secreta_super_segura_tfi_2026
JWT_EXPIRES_IN=24h
```

### 2. Instalación de Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Base de Datos y Población de Datos Iniciales (Seeds)

```bash
cd backend
npm run seed
```

---

## 🖥️ Puesta en Marcha y Despliegue (Nginx & PM2)

### Modo Producción (Requerido por Rúbrica)

1. **Compilar Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
2. **Iniciar Backend con PM2:**
   ```bash
   cd backend
   npm run build
   pm2 start dist/main.js --name "clinica-backend"
   pm2 status
   ```
3. **Servidor Nginx:**
   El frontend compilado se sirve mediante Nginx en el puerto `80`, redirigiendo el proxy `/api/` hacia `http://localhost:3000`.

### Modo Desarrollo

* **Backend:** `cd backend && npm run start:dev`
* **Frontend:** `cd frontend && npm start`

---

## 📚 Documentación Técnica

* **Swagger (API Endpoints & DTOs):**
  Disponible en: `http://localhost:3000/api/docs` (o vía Nginx en `http://localhost/api/docs`)
* **Compodoc (Documentación Frontend):**
  Generar y servir ejecutando:
  ```bash
  cd frontend
  npm run compodoc
  ```
  Acceso local: `http://localhost:8080`

---

## 👥 Integrantes del Grupo

* Florencia Mammana
