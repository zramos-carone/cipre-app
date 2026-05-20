# Changelog - CIPRE

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a nuestra convención local definida en `docs/COMMIT.md`.

## [Unreleased]

### [2026-05-20]
#### Added (Añadido)
- **DB:** [Task 5.1.1] Reestructuración del modelo de citas (`Appointment`) en base de datos agregando campos `type`, `modality`, `duration` y `sendReminder`.
- **Agenda:** [Task 5.1.2] Creación del esquema de validación `AppointmentSchema` con Zod y sus correspondientes pruebas unitarias con cobertura del 100%.
- **Agenda:** [Task 5.1.3] Implementación del Server Action de validación de disponibilidad `checkPsychologistAvailability` con algoritmo de solapamiento dinámico y sus pruebas unitarias.
- **Agenda:** [Task 5.1.4] Implementación de los Server Actions `createAppointment` y `updateAppointment` con Zod y validación de disponibilidad integrada.
- **Agenda:** [Task 5.1.5] Implementación de los Server Actions `cancelAppointment` y `getAppointments` con filtros avanzados y búsqueda en tiempo real de pacientes.
- **Agenda:** [Task 5.1.6] Desarrollo del Server Action auxiliar `getPsychologists` para recuperar usuarios activos con rol 'Psicología'.
---

## [0.2.0] - 2026-05-10
### Added (Añadido)
- **DB:** Inicialización del ORM Prisma en el proyecto (`prisma/schema.prisma` y dependencias base).
- **DB:** Definición completa del esquema de base de datos en `schema.prisma` (Modelos RBAC, Pacientes, Citas, Notas, Pagos, Asistencia).
- **QA:** Instalación y configuración de Vitest para pruebas unitarias automatizadas.
- **QA:** Implementación de la primera prueba de validación estructural (Prisma Client).
- **Auth:** Integración del adaptador de base de datos (`@next-auth/prisma-adapter`) para NextAuth.
- **Auth:** Implementación de funciones seguras para hashing y comparación de contraseñas (`bcryptjs`).
- **Auth:** Configuración del API Route handler y transición de Mock a validación real con base de datos en `authOptions`.
- **Auth:** Creación del Server Action de Login con validación robusta mediante `Zod`.
- **UI:** [Task 3.1.6] Integración de perfil de usuario real y logout en Sidebar (UI + Tests).
- **Patients:** [Task 4.1.1] Creación de esquema de validación `PatientSchema` con Zod.
- **Patients:** [Task 4.1.2] Implementación de Server Action `createPatient` para registro de pacientes.
- **Patients:** [Task 4.1.3] Implementación de Server Action `getPatients` con soporte para búsqueda y paginación.
- **Patients:** [Task 4.1.4] Implementación de Server Action `updatePatient` para edición de pacientes.
- **Patients:** [Task 4.1.5] Implementación de Server Action `deletePatient` (desactivación lógica/soft delete).
- **QA:** [Task 4.1.6] Finalización de cobertura de pruebas unitarias para Server Actions de pacientes (12 casos de prueba).
- **UI:** [Task 4.2.1] Desarrollo del componente `PatientTable` con diseño premium y soporte responsivo.
- **UI:** [Task 4.2.2] Creación del formulario `PatientForm` y el modal `PatientDialog` con validaciones integradas.
- **UI:** [Task 4.2.3] Integración de búsqueda en tiempo real (debounced) y paginación en la UI de pacientes.
- **UI:** [Task 4.3.1] Implementación de Skeletons de carga y sistema de notificaciones (Toasts) con Sonner.
- **Infraestructura:** [Task 3.2.3] Sincronización de usuarios base (Admin, Psicóloga, Recepción) en la base de datos.
- **Infraestructura:** [Task 3.2.4] Configuración y validación de variables de entorno de seguridad (`NEXTAUTH_SECRET`).
- **DevOps:** Creación de `docs/DEPLOYMENT.md` con guía completa para Vercel.
- **DevOps:** Configuración de script `postinstall` en `package.json` para generación automática de Prisma en CI/CD.

### Changed (Modificado)
- **Auth:** [Task 3.1.5] Refinamiento de Middleware para RBAC dinámico.
- **Infraestructura:** [Task 3.2.2] Migración a Driver Adapter (`pg`) para compatibilidad total con Prisma 7 y TCP directo.
- **Auth:** Refinamiento del Middleware de seguridad con reglas RBAC dinámicas para proteger rutas sensibles (Historial, Usuarios).

### Fixed (Corregido)
- **Infraestructura:** [Task 3.2.1] Corrección de bug de sincronización de nombres en la sesión (`fullName`).

---

## [0.1.0] - 2026-05-09
### Added (Añadido)
- **QA:** Integración del *Definition of Done* y directrices estrictas de Testing Unitario (`TESTING.md`).
- **UI:** Construcción de la vista de login personalizada `/login` y conexión dinámica de la sesión en la barra lateral del Dashboard.
- **Auth:** Integración nativa de NextAuth con un Middleware para protección de rutas basada en roles (RBAC) usando perfiles estáticos (Mock).
- **Core:** Creación del módulo completo de Asistencia con soporte para coordenadas geográficas (Geolocalización).
- **Docs:** Consolidación de la arquitectura del sistema, diagramas Entidad-Relación (`DATABASE.md`) y plan de trabajo Ágil (`PLANNING.md`).

### Changed (Modificado)
- **Deps:** Instalación de dependencias críticas de seguridad y manejo de sesiones (`next-auth`).
- **UI:** Actualización del menú lateral para incluir el nuevo acceso al módulo de asistencia.

---

## [0.0.1] - 2026-04-25
### Added (Añadido)
- **Core:** Inicialización base del proyecto web (Next.js 16 App Router, React 19, Tailwind CSS v4).
- **Deploy:** Despliegue inicial de la arquitectura en Vercel.

### Fixed (Corregido)
- **Routing:** Solución del problema de redirección en la ruta raíz (`/`) migrando a *Client-Side Navigation* para sortear la limitación de middleware en Vercel Edge (Fix 404 Error).
