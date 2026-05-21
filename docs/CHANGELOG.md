# Changelog - CIPRE

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a nuestra convención local definida en `docs/COMMIT.md`.

## [0.4.11] - 2026-05-21
### Added (Añadido)
- **Consent:** [Feature 6] Implementación de la funcionalidad completa del botón "Descargar" (⬇️) para descargar el PDF del consentimiento informado directamente al dispositivo del usuario, creando un enlace `<a download>` programático con el nombre del archivo extraído de la URL del documento.

## [0.4.10] - 2026-05-21
### Added (Añadido)
- **Consent:** [Feature 6] Implementación de la funcionalidad completa del botón "Ver" (👁️) para abrir el PDF del consentimiento informado en una nueva pestaña del navegador, propagando el campo `documentUrl` desde la base de datos hasta el frontend a través de la interfaz `Consent`.
- **Consent:** Generación de archivos PDF reales para las 3 plantillas de consentimiento (`tratamiento.pdf`, `datos.pdf`, `evaluacion.pdf`) en `public/uploads/`, reemplazando la referencia genérica `/uploads/test.pdf`.
### Fixed (Corregido)
- **QA:** Corrección de la prueba unitaria en `components/dashboard/consentimientos/informed-consent.test.tsx` para reflejar la estandarización del botón "Generar Consentimiento" y la eliminación del botón "Cancelar" del formulario.

## [0.4.9] - 2026-05-21
### Changed (Modificado)
- **UI:** Estandarización completa del botón "Generar Consentimiento" en el modal de consentimientos informados (`components/dashboard/consentimientos/informed-consent-form.tsx`) para unificar el patrón visual con los modales de pacientes y agenda:
  - Reemplazo del icono `FileText` por el icono estándar `Save` con margen derecho (`mr-2 h-4 w-4`).
  - Implementación del spinner de carga `Loader2` con animación `animate-spin` en lugar del elemento `<span>` personalizado.
  - Aplicación de clases CSS idénticas a los otros modales: `w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer`.
  - Reestructuración del layout de botones: botón de submit de ancho completo en la parte superior, botón "Cancelar" (outline) debajo con separador `border-t` consistente con el patrón establecido.

## [0.4.8] - 2026-05-20
### Changed (Modificado)
- **UI:** Estandarización y refinamiento estético de la cabecera y el contenedor de diseño del módulo de consentimientos informados (`app/dashboard/consentimientos/page.tsx`) para unificarse completamente con el diseño de la Agenda de Citas:
  - Reemplazo del banner superior de ancho completo por un encabezado en línea con el nombre de la clínica y una insignia de fecha formateada tipo cápsula estilizada.
  - Rediseño de la fila de título principal y descripción con la tipografía e interlineados unificados, incorporando el icono animado de `FileText`.
  - Estilización premium y micro-animaciones del botón "Nuevo Consentimiento" para heredar la sombra de acento y transiciones de traslación del botón original de la Agenda de Citas.

## [0.4.7] - 2026-05-20
### Changed (Modificado)
- **UI:** Rediseño estético y de márgenes del módulo de consentimientos informados basado en el mockup visual:
  - Creación de un encabezado de ancho completo (*Full Width Top Bar*) con línea divisoria fina (`border-b`).
  - Rediseño de las tarjetas del listado de consentimientos (removiendo el switch de firma y agregando badges limpios de estado "Firmado" en verde y "Pendiente" en naranja, alineados perfectamente con la fecha).
  - Preservación de la interactividad de firma haciendo que los propios badges de estado sean botones cliqueables para alternar la firma con respuestas visuales instantáneas (*Toasts*).
  - Estilización del botón "Nuevo Consentimiento" (color azul sólido premium, bordes redondeados estándar `rounded-lg`, sombras y transiciones premium).
  - Ajuste de color del tercer tipo de plantilla disponible ("Evaluación Psicológica") a morado, logrando simetría e identidad con el diseño del mockup.
  - Implementación de un fondo de página gris premium (`#f8fafc`) que acentúa las tarjetas y componentes blancos.

## [0.4.6] - 2026-05-20
### Added (Añadido)
- **QA:** [Task 6.2.4] Cobertura de pruebas unitarias completas con Vitest para el Server Action `generateInformedConsent` en `lib/actions/consent.test.ts`, incorporando 5 nuevos casos de prueba exitosos para verificar de forma robusta la generación correcta, errores de validación de Zod, no existencia del paciente, rechazo de duplicados (1 a 1) y control de excepciones internas.

## [0.4.5] - 2026-05-20
### Added (Añadido)
- **Consent:** [Task 6.2.3] Creación del Server Action `generateInformedConsent` en `lib/actions/consent.ts` para persistir nuevos registros de consentimiento informado validados con Zod, enlazados de forma exclusiva (1 a 1) al paciente correspondiente en la base de datos de Prisma.

### Changed (Modificado)
- **Consent:** Integración del flujo de base de datos en la página de consentimientos (`app/dashboard/consentimientos/page.tsx`), cargando dinámicamente pacientes y consentimientos de la base de datos a través de Server Actions (`getPatients`, `getInformedConsents`) y enlazando el envío del formulario con la base de datos mediante `generateInformedConsent`.

## [0.4.4] - 2026-05-20
### Added (Añadido)
- **Consent:** [Task 6.2.2] Creación del esquema de validación `consentFormSchema` con Zod en `lib/validations/consent.ts` para garantizar la integridad de los datos del formulario de consentimiento informado (ID de paciente obligatorio, plantilla de tipo enum válida y fecha de emisión válida).
- **QA:** Cobertura de pruebas unitarias con Vitest agregando 4 nuevos tests exitosos en `lib/validations/consent.test.ts` para validar las restricciones del esquema Zod bajo múltiples escenarios de éxito y fallo (para un total de 125 tests exitosos en la suite).

### Changed (Modificado)
- **Consent:** Refactorización del controlador `handleSubmit` en el componente frontend `InformedConsentForm` para validar los campos a través del esquema Zod `consentFormSchema.safeParse` y desplegar de forma reactiva el primer error de validación detectado.

## [0.4.3] - 2026-05-20
### Added (Añadido)
- **Consent:** [Task 6.2.1] Creación del modal interactivo `InformedConsentForm` y su contenedor `InformedConsentDialog` en el Frontend, con selectores avanzados para Paciente (autocompletado interactivo con Popover y Command), Plantilla (Select) y Fecha (datepicker), aplicando botones de diseño premium con sombras, transiciones y micro-animaciones dinámicas (`active:scale-95`).
- **Consent:** Integración del modal de creación de consentimientos informados en el dashboard principal (`app/dashboard/consentimientos/page.tsx`) con soporte para inserciones simuladas locales y notificaciones animadas de éxito de `sonner`.
- **QA:** Cobertura de pruebas unitarias con Vitest agregando 6 nuevos tests exitosos para verificar el renderizado, validación visual y estados del formulario y diálogo en `components/dashboard/consentimientos/informed-consent.test.tsx` (para un total de 121 tests exitosos en la suite).

## [0.4.2] - 2026-05-20
### Added (Añadido)
- **Consent:** [Task 6.1.3] Desarrollo de un control Switch interactivo y animado en el Frontend (`app/dashboard/consentimientos/page.tsx`) para alternar dinámicamente el estado de firma del consentimiento informado, con soporte para actualizaciones optimistas del cliente, integración asíncrona del Server Action `toggleConsentSignature` y notificaciones Toast animadas de `sonner`.
- **QA:** Cobertura de pruebas unitarias al 100% para la lógica del Server Action `toggleConsentSignature` en `lib/actions/consent.test.ts` sumando 4 nuevos tests (para un total de 115 tests exitosos en la suite).
- **Consent:** Creación del Server Action `toggleConsentSignature(id, isSigned)` en `lib/actions/consent.ts` para posibilitar la alternancia del estado y fecha de la firma en la base de datos de Prisma de forma trazable y segura.

## [0.4.1] - 2026-05-20
### Added (Añadido)
- **Consent:** [Task 6.1.2] Creación de Server Actions para subir y enlazar la URL de los documentos de consentimiento a un paciente (`uploadInformedConsent` con lógica de upsert 1-1 y `getInformedConsents`).
- **QA:** Cobertura de pruebas unitarias con Vitest al 100% en `lib/actions/consent.test.ts` agregando 7 nuevos tests exitosos a la suite.

## [0.4.0] - 2026-05-20
### Added (Añadido)
- **Storage:** [Task 6.1.1] Configuración del proveedor de almacenamiento cloud con Vercel Blob y desarrollo de un fallback local robusto para entornos de desarrollo y testing.
- **QA:** Cobertura de pruebas unitarias al 100% en `lib/storage.test.ts` agregando 3 nuevos tests exitosos a la suite.

## [0.3.0] - 2026-05-20
### Added (Añadido)
- **DB:** [Task 5.1.1] Reestructuración del modelo de citas (`Appointment`) en base de datos agregando campos `type`, `modality`, `duration` y `sendReminder`.
- **Agenda:** [Task 5.1.2] Creación del esquema de validación `AppointmentSchema` con Zod y sus correspondientes pruebas unitarias con cobertura del 100%.
- **Agenda:** [Task 5.1.3] Implementación del Server Action de validación de disponibilidad `checkPsychologistAvailability` con algoritmo de solapamiento dinámico y sus pruebas unitarias.
- **Agenda:** [Task 5.1.4] Implementación de los Server Actions `createAppointment` y `updateAppointment` con Zod y validación de disponibilidad integrada.
- **Agenda:** [Task 5.1.5] Implementación de los Server Actions `cancelAppointment` y `getAppointments` con filtros avanzados y búsqueda en tiempo real de pacientes.
- **Agenda:** [Task 5.1.6] Desarrollo del Server Action auxiliar `getPsychologists` para recuperar usuarios activos con rol 'Psicología'.
- **Agenda:** [Task 5.1.7] Cobertura completa de pruebas unitarias con Vitest para todos los Server Actions de citas (22 pruebas exitosas en total).
- **UI:** [Task 5.1.8] Desarrollo del componente de formulario premium `AppointmentForm` con combobox autocompletable para pacientes y campos de fecha, hora, duración, modalidad y toggle de recordatorio.
- **UI:** [Task 5.1.9] Implementación del diálogo modal premium `AppointmentDialog` en la agenda para encapsular la creación y edición de citas con sus respectivas pruebas de integración.
- **UI:** [Task 5.1.11] Integración de componentes Skeletons y Toasts animadas (`sonner`) en la vista de Agenda para alertar éxitos, errores o choques de horarios de manera visual y de alta fidelidad.
- **QA:** [Task 5.1.12] Ejecución y validación del 100% de la suite de pruebas del proyecto (101 pruebas exitosas) garantizando cero regresiones y cumplimiento estricto del Definition of Done (DoD).
- **DB:** Incorporación de psicólogos base de alta fidelidad ("Dr. Fernando Gómez" y "Dra. Laura Torres") en el script de siembra local `prisma/seed-local.ts` para posibilitar la asignación de profesionales en las citas de la agenda.

### Changed (Modificado)
- **UI:** Rediseño completo de la estructura y dimensiones del formulario de citas (`AppointmentForm`) implementando la rejilla de alta fidelidad de 2 columnas (para Paciente/Psicólogo, Tipo/Modalidad y Estado/Recordatorios) y 3 columnas (para Fecha/Hora/Duración), agregando iconos azules premium en cada etiqueta y encapsulando el switch de recordatorios en una tarjeta con descripción detallada.
- **UI:** Estandarización del botón de acción principal de la agenda ("Guardar Cita" / "Actualizar Cita" con icono `Save`) para ocupar el 100% del ancho (`w-full`), aplicando estilos premium consistentes con el formulario de pacientes (altura `h-11`, negrita, sombra azul de acento `shadow-primary/20` y micro-animación `active:scale-95`), junto con la remoción del botón secundario redundante "Cancelar" para optimizar el flujo del formulario.
- **QA:** Validación de los flujos de interacción y actualización de las pruebas de integración en `appointment-dialog.test.tsx` para garantizar que la remoción del botón de cancelación y la reestructuración del botón principal mantengan la estabilidad del sistema al 100%.
- **UI:** Corrección del comportamiento de desplazamiento del menú lateral (`DashboardSidebar`) en el panel principal [layout.tsx], reestructurando el contenedor con las clases `h-screen overflow-hidden` y el panel de contenido a `overflow-y-auto bg-background` para asegurar que la barra lateral permanezca completamente fija y estática a la izquierda mientras que el contenido principal (como el calendario) se desplaza de forma independiente.

### Fixed (Corregido)
- **UI:** Corrección del ancho por defecto del componente selector (`SelectTrigger`) en `components/ui/select.tsx`, reemplazando la clase restrictiva `w-fit` con `w-full` para permitir que todos los elementos de selección del sistema se expandan correctamente al ancho total de sus columnas de la rejilla (50% en el formulario de citas), logrando una simetría y alineación visual perfectas con respecto al campo de paciente y otros campos de texto.
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
