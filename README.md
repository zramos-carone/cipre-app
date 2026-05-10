# CIPRE - Sistema de Gestión Clínica 🏥

**CIPRE** es una aplicación tipo CRM enfocada en la gestión operativa de una clínica psicológica preventiva. El sistema proporciona un dashboard dinámico y centralizado que se adapta a los distintos perfiles de usuario, facilitando la administración de pacientes, citas, y actividad clínica.

## ✨ Características Principales

El sistema está estructurado en módulos para cubrir la operativa diaria de la clínica:

- **Dashboard Principal**: Métricas y vista general.
- **Control de Pacientes**: Gestión del directorio y contacto de pacientes.
- **Agenda**: Visualización y gestión de citas.
- **Consentimientos Informados**: Estatus y control de documentos legales.
- **Historial Clínico**: Notas y seguimiento de las sesiones.
- **Control de Acceso (Asistencia)**: Módulo de registro de entradas y salidas de personal utilizando geolocalización.
- **Gestión Financiera**: Devoluciones y pagos.

## 👥 Perfiles de Usuario (Roles)

El acceso al sistema y la visibilidad de los módulos dependen del rol asignado:

1. **Administración**: Vista global de la clínica, métricas, finanzas y control general. Acceso condicionado a notas clínicas por privacidad.
2. **Psicólogo**: Acceso enfocado a sus propios pacientes, agenda personal, y notas clínicas autorizadas.
3. **Recepción**: Perfil operativo sin acceso a información clínica sensible. Puede gestionar agenda, pagos y datos de contacto de pacientes.

## 🛠️ Tecnologías Utilizadas

Este proyecto es una aplicación moderna desarrollada con el ecosistema de React:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Autenticación (RBAC)**: [NextAuth.js](https://next-auth.js.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes Base**: Radix UI primitives (estilo shadcn/ui)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Analíticas**: Vercel Analytics

## 🚀 Empezando (Desarrollo Local)

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

1. Clona este repositorio o asegúrate de estar en la carpeta raíz.
2. Instala las dependencias. Puedes usar `npm` o `pnpm`:
   ```bash
   npm install
   # o
   pnpm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   pnpm dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📂 Estructura del Proyecto

* `/app` - Rutas y vistas de la aplicación (Next.js App Router).
* `/components` - Componentes reutilizables de UI (botones, barras laterales, módulos como *asistencia*).
* `/lib` - Utilidades generales y configuración.

---
*Documentación inicial generada para el equipo de desarrollo de CIPRE.*
