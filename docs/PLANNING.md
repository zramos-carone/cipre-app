# 📋 WORKPLAN - CIPRE (Metodología Ágil)

Este documento centraliza el roadmap del proyecto bajo una estructura ágil (Scrum), dividiendo el trabajo de forma atómica y granular.

## 🔄 WORKFLOW
El ciclo de vida del desarrollo seguirá esta jerarquía estricta y orden de ejecución:
`Backlog -> Feature -> User Story -> Task -> Code -> Test -> Commit -> Changelog`

### ✅ Definition of Done (DoD)
Para asegurar la calidad del proyecto, **ninguna Tarea (Task) se marca como completada `[x]` a menos que cuente con su respectiva prueba unitaria o validación funcional**. Consulta el documento `docs/TESTING.md` para conocer la estrategia. Todo código nuevo debe venir acompañado de su Test correspondiente.


## 📦 BACKLOG DE PRODUCTO

### 🚀 Feature 1: Base de Datos y ORM
**Objetivo:** Establecer la infraestructura de persistencia de datos del sistema.
* **User Story 1.1:** Como desarrollador, quiero tener un ORM configurado para gestionar la base de datos.
  * [x] **Task 1.1.1:** Inicializar Prisma (o Drizzle) en el proyecto.
  * [x] **Task 1.1.2:** Traducir `DATABASE.md` a un archivo `schema.prisma` real con modelos RBAC (`User`, `Role`, `Permission`).
  * [x] **Task 1.1.3:** Ejecutar la primera migración o sincronización hacia la base de datos.

### 🧪 Feature 2: Infraestructura de QA y Testing
**Objetivo:** Establecer el entorno automatizado para cumplir con el Definition of Done.
* **User Story 2.1:** Como desarrollador, quiero tener un framework de pruebas unitarias instalado y configurado.
  * [x] **Task 2.1.1:** Instalar y configurar Vitest en el entorno de Next.js.
  * [x] **Task 2.1.2:** Crear una prueba de validación estructural inicial para verificar que el framework funciona correctamente.

### 🔒 Feature 3: Autenticación Real (NextAuth + BD)
**Objetivo:** Establecer la seguridad y control de acceso definitivo.
* **User Story 3.1:** Como administrador, quiero que los usuarios inicien sesión con credenciales reales y cifradas.
  * [x] **Task 3.1.1:** Instalar y configurar el adaptador de base de datos (`@next-auth/prisma-adapter`).
  * [x] **Task 3.1.2:** Implementar utilidades de cifrado de contraseñas con `bcryptjs`.
  * [x] **Task 3.1.3:** Configurar el archivo de opciones de NextAuth y el API Route handler.
  * [x] **Task 3.1.4:** Desarrollar el Server Action para la lógica de autenticación (Login).
  * [x] **Task 3.1.5:** Actualizar el Middleware para protección de rutas basada en sesiones reales.
  * [x] **Task 3.1.6:** Vincular el perfil de usuario en la Sidebar con los datos de la sesión activa.
  * [x] **Task 3.2.1:** Sincronizar campos de esquema Prisma con lógica de NextAuth (fullName).
  * [x] **Task 3.2.2:** Implementar Driver Adapter (`pg`) para estabilidad de conexión en Prisma 7.
  * [x] **Task 3.2.3:** Crear script de seeding para usuarios administrativos iniciales.
  * [x] **Task 3.2.4:** Validar variables de entorno críticas (`NEXTAUTH_SECRET`).

### 👥 Feature 4: Gestión de Pacientes
**Objetivo:** Agilizar el ingreso y directorio del día a día de la clínica.
* **User Story 4.1:** Como recepcionista, quiero registrar y consultar pacientes.
  * [x] **Task 4.1.1:** Crear esquema de validación `PatientSchema` con Zod.
  * [x] **Task 4.1.2:** Implementar Server Action `createPatient` para registro.
  * [x] **Task 4.1.3:** Implementar Server Action `getPatients` con búsqueda y paginación.
  * [x] **Task 4.1.4:** Implementar Server Action `updatePatient` para edición.
  * [x] **Task 4.1.5:** Implementar Server Action `deletePatient` (desactivación).
  * [x] **Task 4.1.6:** Crear pruebas unitarias para Server Actions de pacientes.
  * [x] **Task 4.2.1:** Desarrollar componente `PatientTable` para listado.
  * [x] **Task 4.2.2:** Crear modal/formulario `PatientForm` para CRUD.
  * [x] **Task 4.2.3:** Integrar búsqueda en tiempo real y paginación en UI.
  * [x] **Task 4.3.1:** Añadir Skeletons y Toasts (sonner) para feedback de UX.
* **User Story 4.4:** Como recepcionista, quiero capturar información detallada del paciente (nombre, apellidos, fecha de nacimiento, edad, género, dirección y contacto de emergencia) para tener un expediente clínico completo.
  * [x] **Task 4.4.1:** Actualizar el esquema de Prisma (`schema.prisma`) para reestructurar la tabla `Patient` (dividir `fullName` en `name` y `lastName`, y agregar `birthDate`, `age`, `gender`, `address` y `emergencyContact`), generar y aplicar la migración.
  * [x] **Task 4.4.2:** Modificar el esquema de validación `PatientSchema` con Zod en `lib/validations/patient.ts` y actualizar sus pruebas unitarias en `lib/validations/patient.test.ts`.
  * [x] **Task 4.4.3:** Adaptar los Server Actions `createPatient`, `updatePatient` y `getPatients` en `lib/actions/patients.ts` para manejar y persistir los nuevos campos del paciente (incluyendo la lógica de búsqueda integrada).
  * [x] **Task 4.4.4:** Rediseñar el formulario `PatientForm` en `components/dashboard/patients/patient-form.tsx` con el nuevo diseño y campos (Nombre(s), Apellidos, Fecha de Nacimiento, Edad, Género, Dirección, Teléfono, Email y Contacto de Emergencia).
  * [x] **Task 4.4.5:** Actualizar los componentes de visualización `PatientTable`, `PatientDialog` y `PatientsClient` en `components/dashboard/patients/` para desplegar y pasar la información actualizada del paciente.
  * [x] **Task 4.4.6:** Corregir y validar todas las pruebas unitarias y de integración del módulo de pacientes para asegurar el cumplimiento del Definition of Done (DoD).

### 📅 Feature 5: Sistema de Citas (Agenda)
**Objetivo:** Evitar conflictos y mejorar la visualización de tiempos para los psicólogos.
* **User Story 5.1:** Como recepcionista/psicólogo, quiero agendar citas evitando choques de horarios.
  * [x] **Task 5.1.1:** Actualizar el esquema de Prisma (`schema.prisma`) para agregar los nuevos campos al modelo `Appointment` (`type` para tipo de cita, `modality` para modalidad, `duration` para duración de la cita en minutos, y `sendReminder` para habilitar el recordatorio por SMS/Email), generar y aplicar la sincronización con la base de datos.
  * [x] **Task 5.1.2:** Crear el esquema de validación `AppointmentSchema` con Zod en `lib/validations/appointment.ts` (con validación de campos `patientId`, `psychologistId`, `scheduledAt` (fecha y hora combinadas), `type`, `modality`, `duration`, `status`, `notes` y `sendReminder`), y diseñar sus correspondientes pruebas unitarias en `lib/validations/appointment.test.ts`.
  * [ ] **Task 5.1.3:** Implementar el Server Action de validación de disponibilidad `checkPsychologistAvailability` para detectar conflictos de agenda activa en base al solapamiento de intervalos de tiempo calculados dinámicamente según la duración (`duration`) de las citas (excluyendo la cita actual en edición).
  * [ ] **Task 5.1.4:** Desarrollar los Server Actions `createAppointment` y `updateAppointment` en `lib/actions/appointments.ts`, integrando la verificación de disponibilidad y retornando respuestas de error oportunas en caso de conflicto.
  * [ ] **Task 5.1.5:** Implementar los Server Actions `cancelAppointment` (actualización de estado a `"Cancelada"`) y `getAppointments` (con filtros de psicólogo, tipo de cita y rango de fechas para el calendario, y soporte de búsqueda de paciente integrada).
  * [ ] **Task 5.1.6:** Desarrollar el Server Action auxiliar `getPsychologists` para recuperar todos los usuarios activos con rol `'Psicología'`.
  * [ ] **Task 5.1.7:** Crear pruebas unitarias completas con Vitest para todos los Server Actions de citas en `lib/actions/appointments.test.ts` simulando la base de datos con mocks de Prisma.
  * [ ] **Task 5.1.8:** Desarrollar el componente de formulario `AppointmentForm` en `components/dashboard/agenda/appointment-form.tsx` implementando todos los campos de la interfaz visual: **Paciente** (búsqueda interactiva combobox/autocomplete), **Psicólogo Asignado**, **Tipo de Cita**, **Modalidad** (Presencial, En línea), **Fecha**, **Hora**, **Duración** (en minutos), **Estado**, **Notas Adicionales** y el toggle/checkbox de **Enviar recordatorio por SMS/Email al paciente**.
  * [ ] **Task 5.1.9:** Implementar el modal interactivo `AppointmentDialog` en `components/dashboard/agenda/appointment-dialog.tsx` para encapsular la lógica de creación y edición.
  * [ ] **Task 5.1.10:** Rediseñar y sincronizar la vista principal `AgendaPage` en `app/dashboard/agenda/page.tsx` para cargar citas reales desde la base de datos, refrescar dinámicamente según filtros de búsqueda y psicólogo, y reaccionar a clics sobre días y citas.
  * [ ] **Task 5.1.11:** Integrar Skeletons para estados de carga y Toasts (`sonner`) en el Frontend para alertar éxitos, errores o choques de horarios de manera visual y premium.
  * [ ] **Task 5.1.12:** Ejecutar y asegurar que el 100% de la suite de pruebas del proyecto pase limpiamente, cumpliendo estrictamente con el Definition of Done (DoD).

### 📊 Feature 6: Dashboard Principal
**Objetivo:** Centralizar los indicadores más importantes de la clínica.
* **User Story 6.1:** Como administrador, quiero ver métricas clave del día al entrar al sistema.
  * [ ] **Task 6.1.1:** Crear queries SQL optimizadas para KPIs (pacientes activos, citas de hoy).
  * [ ] **Task 6.1.2:** Enlazar los datos obtenidos con las tarjetas de métricas del Dashboard.

### 🩺 Feature 7: Historial Clínico Seguro
**Objetivo:** Proteger la confidencialidad absoluta de las notas médicas.
* **User Story 7.1:** Como psicólogo, quiero redactar y ver notas clínicas de mis pacientes de forma privada.
  * [ ] **Task 7.1.1:** Crear API de Historial Clínico con protección middleware (rechazar peticiones del rol Recepción).
  * [ ] **Task 7.1.2:** Implementar filtro a nivel BD para que un psicólogo solo lea sus propias notas.
  * [ ] **Task 7.1.3:** Conectar formulario del Frontend con un editor de texto enriquecido.

### 📝 Feature 8: Consentimientos Informados
**Objetivo:** Gestionar el estatus legal y documental de los pacientes.
* **User Story 8.1:** Como administración, quiero almacenar digitalmente las firmas y permisos.
  * [ ] **Task 8.1.1:** Configurar proveedor de almacenamiento cloud (AWS S3, Vercel Blob) para PDFs.
  * [ ] **Task 8.1.2:** Crear API para subir y enlazar la URL de los documentos a un paciente.
  * [ ] **Task 8.1.3:** Desarrollar un Switch/Toggle en el Frontend para actualizar el campo `isSigned`.

### 💳 Feature 9: Pagos y Devoluciones
**Objetivo:** Llevar control transaccional preciso y auditable.
* **User Story 9.1:** Como administración, quiero gestionar los ingresos de la clínica.
  * [ ] **Task 9.1.1:** Crear lógica en BD para registrar nuevos abonos en la tabla `Payment`.
  * [ ] **Task 9.1.2:** Implementar Server Action para `Refund` garantizando validación estricta de rol (solo Admin).
  * [ ] **Task 9.1.3:** Conectar y dar vida a las vistas de pagos y devoluciones en el Frontend.

### ⏱️ Feature 10: Módulo de Asistencia Cloud
**Objetivo:** Migrar el registro temporal de los empleados a la nube.
* **User Story 10.1:** Como empleado, quiero registrar mi hora de entrada y salida de forma trazable.
  * [ ] **Task 10.1.1:** Mapear la tabla `AttendanceRegistry` en Prisma.
  * [ ] **Task 10.1.2:** Migrar la lógica de guardado temporal (`localStorage`) a un Server Action definitivo.
  * [ ] **Task 10.1.3:** Asegurar que las coordenadas geográficas formen parte del payload a la base de datos.

### ✨ Feature 11: Fiabilidad de UX y UI
**Objetivo:** Mejorar drásticamente la calidad y solidez del sistema de cara al usuario.
* **User Story 11.1:** Como usuario, quiero validaciones y tiempos de carga claros para no cometer errores.
  * [ ] **Task 11.1.1:** Integrar esquemas de validación estricta con `Zod` en todos los modales.
  * [ ] **Task 11.1.2:** Implementar archivos `loading.tsx` (Skeletons) para disimular tiempos de carga.
  * [ ] **Task 11.1.3:** Añadir Toasts (ej. `sonner`) para dar feedback visual de éxito/error en cada petición.
