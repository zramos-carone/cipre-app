# Diagrama Entidad-Relación (CIPRE - Sistema de Gestión Clínica)

A continuación te presento el diagrama ER estructurado **específicamente para CIPRE**, basado en los módulos que hemos identificado (Pacientes, Agenda, Historial, Consentimientos, Pagos y Asistencia).

```mermaid
erDiagram
    User ||--o{ Appointment : "atiende (psicologo)"
    Patient ||--o{ Appointment : "agenda"
    
    User ||--o| Role : "tiene asignado"
    Role ||--o{ Permission : "contiene (N:M)"

    
    Patient ||--o| InformedConsent : "firma"
    
    User ||--o{ ClinicalNote : "redacta (psicologo)"
    Patient ||--o{ ClinicalNote : "pertenece a"
    
    Patient ||--o{ Payment : "realiza"
    Payment ||--o| Refund : "genera"
    
    User ||--o{ AttendanceRegistry : "registra (asistencia)"

    User {
        String id PK
        String email UK
        String password
        String fullName
        String roleId FK
        Boolean active
        DateTime createdAt
    }

    Role {
        String id PK
        String name "Ej: Admin, Psicologo, Recepcion"
        String description
    }

    Permission {
        String id PK
        String action "Ej: read, write, delete"
        String resource "Ej: ClinicalNote, Patient"
    }

    Patient {
        String id PK
        String fullName
        String email
        String phone
        DateTime lastVisit
        DateTime nextAppointment
        DateTime createdAt
    }

    Appointment {
        String id PK
        String patientId FK
        String psychologistId FK "UserId"
        DateTime scheduledAt
        String status "Pendiente, Completada, Cancelada, Reagendada"
        String notes
    }

    InformedConsent {
        String id PK
        String patientId FK "UK"
        String documentUrl
        Boolean isSigned
        DateTime signedAt
    }

    ClinicalNote {
        String id PK
        String patientId FK
        String psychologistId FK "UserId"
        String content "Información sensible"
        DateTime createdAt
        DateTime updatedAt
    }

    Payment {
        String id PK
        String patientId FK
        Float amount
        String method "Efectivo, Tarjeta, Transferencia"
        String status "Completado, Pendiente"
        DateTime createdAt
    }

    Refund {
        String id PK
        String paymentId FK "UK"
        Float amount
        String reason
        DateTime processedAt
    }

    AttendanceRegistry {
        String id PK
        String userId FK
        String type "entrada, salida"
        DateTime timestamp
        Float latitude "Opcional"
        Float longitude "Opcional"
    }
```

### 📋 Descripción de las Entidades del CRM (CIPRE)

1. **`User`, `Role` y `Permission` (RBAC - Roles y Permisos)**
   - El sistema de seguridad. En lugar de un simple texto, ahora `User` se enlaza a un `Role` específico. El `Role` contiene a su vez múltiples `Permission` (Permisos), lo que te permite decidir exactamente qué acciones (leer, escribir, borrar) puede hacer un rol sobre qué recursos (Pacientes, Notas, Pagos).
2. **`Patient` (Pacientes)**
   - Directorio central de pacientes de la clínica. Contiene información de contacto y campos calculados rápidos como `lastVisit`.
3. **`Appointment` (Agenda/Citas)**
   - Relaciona a un `Patient` con un `User` (específicamente con rol de Psicólogo). Controla los estados de reagendamiento.
4. **`InformedConsent` (Consentimientos Informados)**
   - Guarda el estatus legal de cada paciente. Es fundamental para recepción, indicando si el paciente ya firmó la documentación (`isSigned`).
5. **`ClinicalNote` (Historial Clínico)**
   - **Alta confidencialidad.** Relaciona las sesiones (o al paciente) con los apuntes del psicólogo. La base de datos debe contemplar reglas de acceso estrictas para que recepción jamás lea esto.
6. **`Payment` & `Refund` (Pagos y Devoluciones)**
   - Control financiero de las citas. `Refund` se asocia directamente a un pago previo en caso de una devolución por cita cancelada.
7. **`AttendanceRegistry` (Control de Acceso / Asistencia)**
   - Registra la trazabilidad operativa de tu equipo de trabajo para las horas de entrada y salida con su ubicación.
