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
  * [ ] **Task 1.1.3:** Ejecutar la primera migración hacia la base de datos (PostgreSQL/MySQL).

### 🔒 Feature 2: Autenticación Real (NextAuth + BD)
**Objetivo:** Establecer la seguridad y control de acceso definitivo.
* **User Story 2.1:** Como administrador, quiero que los usuarios inicien sesión con credenciales reales y cifradas.
  * [ ] **Task 2.1.1:** Configurar el adaptador de base de datos para NextAuth.
  * [ ] **Task 2.1.2:** Implementar encriptación de contraseñas con `bcryptjs`.
  * [ ] **Task 2.1.3:** Eliminar el mock temporal de `lib/auth.ts` y conectar la validación a la base de datos.
  * [ ] **Task 2.1.4:** Definir Server Actions para la gestión de sesiones y protección de rutas.

### 👥 Feature 3: Gestión de Pacientes
**Objetivo:** Agilizar el ingreso y directorio del día a día de la clínica.
* **User Story 3.1:** Como recepcionista, quiero registrar y consultar pacientes.
  * [ ] **Task 3.1.1:** Crear Server Actions CRUD (Create, Read, Update, Delete) para Pacientes.
  * [ ] **Task 3.1.2:** Conectar la tabla del Frontend con la API de lectura.
  * [ ] **Task 3.1.3:** Implementar paginación y búsqueda en tiempo real en la vista de pacientes.

### 📅 Feature 4: Sistema de Citas (Agenda)
**Objetivo:** Evitar conflictos y mejorar la visualización de tiempos para los psicólogos.
* **User Story 4.1:** Como recepcionista/psicólogo, quiero agendar citas evitando choques de horarios.
  * [ ] **Task 4.1.1:** Crear API para validación de disponibilidad de psicólogos.
  * [ ] **Task 4.1.2:** Desarrollar mutación para crear, actualizar y cancelar citas.
  * [ ] **Task 4.1.3:** Sincronizar el componente del calendario interactivo del Frontend con la base de datos.

### 📊 Feature 5: Dashboard Principal
**Objetivo:** Centralizar los indicadores más importantes de la clínica.
* **User Story 5.1:** Como administrador, quiero ver métricas clave del día al entrar al sistema.
  * [ ] **Task 5.1.1:** Crear queries SQL optimizadas para KPIs (pacientes activos, citas de hoy).
  * [ ] **Task 5.1.2:** Enlazar los datos obtenidos con las tarjetas de métricas del Dashboard.

### 🩺 Feature 6: Historial Clínico Seguro
**Objetivo:** Proteger la confidencialidad absoluta de las notas médicas.
* **User Story 6.1:** Como psicólogo, quiero redactar y ver notas clínicas de mis pacientes de forma privada.
  * [ ] **Task 6.1.1:** Crear API de Historial Clínico con protección middleware (rechazar peticiones del rol Recepción).
  * [ ] **Task 6.1.2:** Implementar filtro a nivel BD para que un psicólogo solo lea sus propias notas.
  * [ ] **Task 6.1.3:** Conectar formulario del Frontend con un editor de texto enriquecido.

### 📝 Feature 7: Consentimientos Informados
**Objetivo:** Gestionar el estatus legal y documental de los pacientes.
* **User Story 7.1:** Como administración, quiero almacenar digitalmente las firmas y permisos.
  * [ ] **Task 7.1.1:** Configurar proveedor de almacenamiento cloud (AWS S3, Vercel Blob) para PDFs.
  * [ ] **Task 7.1.2:** Crear API para subir y enlazar la URL de los documentos a un paciente.
  * [ ] **Task 7.1.3:** Desarrollar un Switch/Toggle en el Frontend para actualizar el campo `isSigned`.

### 💳 Feature 8: Pagos y Devoluciones
**Objetivo:** Llevar control transaccional preciso y auditable.
* **User Story 8.1:** Como administración, quiero gestionar los ingresos de la clínica.
  * [ ] **Task 8.1.1:** Crear lógica en BD para registrar nuevos abonos en la tabla `Payment`.
  * [ ] **Task 8.1.2:** Implementar Server Action para `Refund` garantizando validación estricta de rol (solo Admin).
  * [ ] **Task 8.1.3:** Conectar y dar vida a las vistas de pagos y devoluciones en el Frontend.

### ⏱️ Feature 9: Módulo de Asistencia Cloud
**Objetivo:** Migrar el registro temporal de los empleados a la nube.
* **User Story 9.1:** Como empleado, quiero registrar mi hora de entrada y salida de forma trazable.
  * [ ] **Task 9.1.1:** Mapear la tabla `AttendanceRegistry` en Prisma.
  * [ ] **Task 9.1.2:** Migrar la lógica de guardado temporal (`localStorage`) a un Server Action definitivo.
  * [ ] **Task 9.1.3:** Asegurar que las coordenadas geográficas formen parte del payload a la base de datos.

### ✨ Feature 10: Fiabilidad de UX y UI
**Objetivo:** Mejorar drásticamente la calidad y solidez del sistema de cara al usuario.
* **User Story 10.1:** Como usuario, quiero validaciones y tiempos de carga claros para no cometer errores.
  * [ ] **Task 10.1.1:** Integrar esquemas de validación estricta con `Zod` en todos los modales.
  * [ ] **Task 10.1.2:** Implementar archivos `loading.tsx` (Skeletons) para disimular tiempos de carga.
  * [ ] **Task 10.1.3:** Añadir Toasts (ej. `sonner`) para dar feedback visual de éxito/error en cada petición.

### 🧪 Feature 11: Infraestructura de QA y Testing
**Objetivo:** Establecer el entorno automatizado para cumplir con el Definition of Done.
* **User Story 11.1:** Como desarrollador, quiero tener un framework de pruebas unitarias instalado y configurado.
  * [ ] **Task 11.1.1:** Instalar y configurar Vitest en el entorno de Next.js.
  * [ ] **Task 11.1.2:** Crear una prueba de validación estructural inicial para verificar que el framework funciona correctamente.
