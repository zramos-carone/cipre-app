# 🚀 GUÍA DE DESPLIEGUE - CIPRE

Este documento detalla los pasos y configuraciones necesarias para desplegar la aplicación CIPRE en un entorno de producción (Vercel).

## 📋 Requisitos Previos

1.  **Vercel CLI:** Instalado y logueado (`npm install -g vercel`).
2.  **Base de Datos Cloud:** Una instancia de PostgreSQL accesible (Recomendado: [Neon.tech](https://neon.tech), [Supabase](https://supabase.com) o [Prisma Postgres](https://www.prisma.io/postgres)).
3.  **Variables de Entorno:** Acceso al panel de configuración de Vercel.

---

## 🛠️ Configuración de Infraestructura

### 1. Base de Datos Cloud (Vercel Postgres)
Vercel ofrece bases de datos administradas que se integran automáticamente.

**A. Vía Vercel CLI (Recomendado):**
1. Ejecuta el comando para conectar el almacenamiento:
   ```bash
   vercel storage connect
   ```
2. Sigue las instrucciones para crear una nueva "Postgres Database".
3. Esto inyectará automáticamente variables como `POSTGRES_PRISMA_URL` en tu proyecto.

**B. Vía Dashboard:**
1. Ve a la pestaña **Storage** en tu proyecto de Vercel y crea una base de datos **Postgres**.

### 2. Generación de Valores Críticos

| Variable | Cómo obtenerla / generarla |
| :--- | :--- |
| `DATABASE_URL` | Si usas Vercel Postgres, usa el valor de `POSTGRES_PRISMA_URL`. |
| `NEXTAUTH_SECRET` | Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Es la URL de producción (ej. `https://tu-app.vercel.app`). |

---

## 🚀 Pasos para el Despliegue

### Opción A: Vercel CLI (Recomendado para Debug)
1.  **Vincular el proyecto:**
    ```bash
    vercel link
    ```
2.  **Configurar variables (si no se han hecho en el panel):**
    ```bash
    vercel env add DATABASE_URL production
    vercel env add NEXTAUTH_SECRET production
    ```
3.  **Desplegar a producción:**
    ```bash
    vercel --prod
    ```

### Opción B: Git (CI/CD Automático)
1.  Haz push a la rama `main`.
2.  Vercel detectará el cambio y comenzará el build automáticamente.

---

## ⚠️ Consideraciones Importantes

### 1. Post-install de Prisma
El proyecto está configurado para ejecutar `prisma generate` automáticamente tras la instalación de dependencias. Verifica que en tu `package.json` exista:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### 2. Migraciones y Sincronización en Producción
Cuando agregues nuevos campos o cambies la estructura de la base de datos (como al reestructurar los modelos `Patient` o `Appointment`), la base de datos en la nube quedará desactualizada. Esto provocará que Vercel arroje errores en tiempo de ejecución como `PrismaClientKnownRequestError` con el código `P2022` o errores `ColumnNotFound` (ej. *The column 'Appointment.type' does not exist*).

Para sincronizar de manera segura la base de datos de producción (Neon/Vercel Postgres) con tu esquema local de Prisma actual sin necesidad de alterar tu archivo `.env` de desarrollo, puedes inyectar directamente la variable de entorno en la línea de comandos:

*   **En Windows (PowerShell):**
    ```powershell
    $env:DATABASE_URL="tu_url_de_conexion_de_produccion"; npx prisma db push
    ```

*   **En Linux / Mac (Bash o Zsh):**
    ```bash
    DATABASE_URL="tu_url_de_conexion_de_produccion" npx prisma db push
    ```

> [!IMPORTANT]
> **Definición de valores por defecto**: Asegúrate siempre de definir valores por defecto en el esquema (ej. `@default("seguimiento")` o `@default(false)`) para cualquier columna nueva. Esto permite que Prisma actualice automáticamente todos los registros preexistentes en producción sin producir errores de integridad ni pérdida de datos.

### 3. Middleware de Next.js
En la versión actual de Next.js (15/16), asegúrate de que el `middleware.ts` no intente realizar operaciones pesadas de base de datos que puedan ralentizar el Edge Runtime.

### 4. Driver Adapter
Debido a restricciones en entornos Serverless (como Vercel Functions), el uso del **Driver Adapter (`pg`)** que implementamos es la opción más estable para evitar errores de inicialización del motor binario de Prisma.

---

## 🔍 Troubleshooting (Logs)
Si el despliegue falla o recibes un error 500:
1.  Revisa los logs en tiempo real: `vercel logs --prod`.
2.  Verifica la conectividad de la base de datos: `vercel env pull .env.production` seguido de un test local.
