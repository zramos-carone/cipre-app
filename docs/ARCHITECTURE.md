# CIPRE - Documento de Arquitectura

Este documento describe la arquitectura, las decisiones de diseño y los componentes clave del sistema de gestión clínica **CIPRE**.

## 1. Descripción General del Sistema

**CIPRE** es una aplicación Web responsiva (Single Page Application orientada a servidor mediante App Router) diseñada para administrar la operativa de una clínica psicológica preventiva. Su propósito es digitalizar la gestión de pacientes, citas, historiales clínicos, finanzas y asistencia de personal.

## 2. Tecnologías Principales (Tech Stack)

* **Framework Core**: Next.js 16 (React 19)
* **Arquitectura de Rutas**: App Router (`/app`)
* **Estilizado**: Tailwind CSS v4
* **Componentes Base**: Radix UI primitives (shadcn/ui)
* **Iconografía**: Lucide React
* **Hosting / Despliegue**: Vercel

## 3. Modelo de Datos (Capa Lógica)

El sistema opera bajo un modelo de entidades relacionales. Actualmente, a nivel MVP, la capa de persistencia se simula en estado local y `localStorage`, con una estructura diseñada para migrar directamente a un ORM como **Prisma** o **Drizzle** sobre PostgreSQL o MySQL.

### Entidades Core
* `User`: Gestión de acceso y perfiles de empleados (Administrador, Psicólogo, Recepcionista).
* `Patient`: Directorio clínico.
* `Appointment`: Agenda que cruza `Patient` con `User` (Psicólogo).
* `ClinicalNote`: Historial clínico (Datos sensibles aislados).
* `Payment` / `Refund`: Gestión contable.
* `InformedConsent`: Estatus legal.
* `AttendanceRegistry`: Control de entrada/salida de personal.

## 4. Gestión de Estado y Persistencia (MVP)

En la iteración actual, el estado global no cuenta con una base de datos centralizada.
* **Sesión / Autenticación**: Pendiente de integración con NextAuth.js.
* **Módulo de Asistencia**: Utiliza `localStorage` y la API de `navigator.geolocation` nativa del navegador web, lo cual lo hace compatible para envolverse en una Progressive Web App (PWA) o App Híbrida.

## 5. Arquitectura de Directorios

El código fuente sigue las convenciones estrictas de Next.js App Router:
* `app/`: Contiene los Layouts y Pages que definen las rutas públicas (`/`) y privadas (`/dashboard/*`).
* `components/`:
  * `/dashboard`: Componentes específicos del layout privado (ej. Sidebar).
  * `/asistencia`: Componentes encapsulados para el módulo de control de entradas/salidas.
* `lib/`: Funciones utilitarias (e.g. validación de clases de Tailwind `cn`).

## 6. Seguridad y Permisos (Roadmap)

La aplicación implementa un diseño basado en roles (RBAC - Role-Based Access Control):
* **Capa 1 (Administración)**: Visibilidad analítica y de catálogo completo. Acceso de auditoría restringido a notas clínicas.
* **Capa 2 (Psicólogo)**: Acceso acotado a pacientes asignados y creación/lectura de historial clínico sensible.
* **Capa 3 (Recepción)**: Acceso operativo puro (Agenda, Directorio, Pagos) con restricción absoluta a información clínica (Notas).
