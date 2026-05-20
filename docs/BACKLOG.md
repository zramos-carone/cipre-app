# 📋 CIPRE - Backlog de Tareas y Configuración Local

Este documento detalla el backlog de tareas pendientes para el desarrollo de la aplicación CIPRE y comandos útiles para la gestión local.

---

## ⚙️ Configuración del Entorno de Git

Para evitar confirmar cambios accidentales o locales en tu lista de tareas de este archivo, puedes configurar Git de la siguiente manera:

> [!TIP]
> **Ignorar cambios locales en este archivo**:
> ```bash
> git update-index --skip-worktree docs/BACKLOG.md
> ```
> 
> **Revertir la regla y volver a rastrear los cambios**:
> ```bash
> git update-index --no-skip-worktree docs/BACKLOG.md
> ```

---

## 🚀 Backlog de Tareas Pendientes

### 🗃️ [TODO-1] Reestructuración de Contactos de Pacientes
* **Descripción**: Separar la información del **Contacto de Emergencia** en una nueva tabla dedicada (`PatientContacts`) para permitir campos estructurados (nombre, teléfono, correo) y evitar duplicidad de datos en la tabla principal de `Patient`.

#### 🔗 Nueva Tabla: `PatientContacts`
Representa los contactos asociados a cada paciente:

| Campo | Tipo de Datos | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único del registro (Primary Key). |
| `patientId` | `UUID` | Referencia al paciente asociado (`Patient.id` - Foreign Key). |
| `name` | `String` | Nombre completo del contacto de emergencia. |
| `phone` | `String` | Teléfono de contacto. |
| `email` | `String` | Correo electrónico de contacto. |
| `note` | `String` | Notas adicionales de relación o parentesco. |

> [!NOTE]
> Tras esta separación, la tabla principal `Patient` mantendrá únicamente la información de identificación clínica y el **nombre de contacto de emergencia** para visualización rápida (el teléfono y correo se consultarán desde la tabla `PatientContacts`).

#### 📝 Subtareas de Implementación
- [ ] **Esquema de Base de Datos**: Crear modelo `PatientContacts` en `schema.prisma` y definir relaciones correspondientes con `Patient`.
- [ ] **Migraciones**: Ejecutar migraciones e inicializar semilla local para soportar los nuevos registros.
- [ ] **Capa de Negocio (Backend)**: Modificar Server Actions de pacientes para almacenar la información de forma relacional en ambas tablas.
- [ ] **Validación**: Crear esquema de validación en Zod y añadir tests para asegurar que no se dupliquen datos.
- [ ] **Interfaz de Usuario (UI)**: Adaptar el formulario `PatientForm` para capturar el contacto de emergencia de forma estructurada.

---

### 🔑 [TODO-2] Ajustes de Interfaz del Módulo de Login
* **Descripción**: Ajustar y pulir la experiencia de usuario (UI/UX) del módulo de inicio de sesión de pacientes.

#### 📝 Subtareas de Implementación
- [ ] Revisar estilos responsivos de la pantalla de inicio de sesión en dispositivos móviles.
- [ ] Añadir feedback visual animado en estados de carga de credenciales.
- [ ] Validar visualización de alertas y mensajes de error de autenticación.

---

### 🔑 [TODO-3] 2FA en Login
* **Descripción**: Añadir autenticación de dos factores (2FA) al módulo de inicio de sesión de pacientes.

#### 📝 Subtareas de Implementación
- [ ] Crear modelo de datos para 2FA.
- [ ] Crear flujo de registro y verificación de 2FA.
- [ ] Implementar flujo de inicio de sesión con 2FA.
- [ ] Añadir validaciones de seguridad.
- [ ] Añadir interfaz de usuario para 2FA.
