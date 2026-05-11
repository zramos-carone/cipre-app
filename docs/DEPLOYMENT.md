# 🚀 GUÍA DE DESPLIEGUE - CIPRE

Este documento detalla los pasos y configuraciones necesarias para desplegar la aplicación CIPRE en un entorno de producción (Vercel).

## 📋 Requisitos Previos

1.  **Vercel CLI:** Instalado y logueado (`npm install -g vercel`).
2.  **Base de Datos Cloud:** Una instancia de PostgreSQL accesible (Recomendado: [Neon.tech](https://neon.tech), [Supabase](https://supabase.com) o [Prisma Postgres](https://www.prisma.io/postgres)).
3.  **Variables de Entorno:** Acceso al panel de configuración de Vercel.

---

## 🛠️ Configuración de Infraestructura

### 1. Base de Datos (Prisma)
Vercel no puede conectar a un `localhost`. Debes obtener una cadena de conexión `postgresql://` de tu proveedor cloud.

> [!IMPORTANT]
> Si usas **Prisma Postgres** (protocolo `prisma+postgres://`), asegúrate de que el entorno de despliegue sea compatible con Prisma 7.

### 2. Variables de Entorno Críticas
Deben configurarse en el Dashboard de Vercel (**Settings > Environment Variables**):

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de la base de datos cloud. | `postgres://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Clave para cifrar tokens (mínimo 32 caracteres). | `73a28490a51b42568423b4c6e82618c8` |
| `NEXTAUTH_URL` | URL base del despliegue. | `https://cipre.arpalogic.site` |

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

### 2. Migraciones
Antes del primer despliegue, debes sincronizar el esquema de la base de datos cloud con tu modelo actual:
```bash
# Cambia temporalmente tu .env local a la URL de la nube y ejecuta:
npx prisma db push
```

### 3. Middleware de Next.js
En la versión actual de Next.js (15/16), asegúrate de que el `middleware.ts` no intente realizar operaciones pesadas de base de datos que puedan ralentizar el Edge Runtime.

### 4. Driver Adapter
Debido a restricciones en entornos Serverless (como Vercel Functions), el uso del **Driver Adapter (`pg`)** que implementamos es la opción más estable para evitar errores de inicialización del motor binario de Prisma.

---

## 🔍 Troubleshooting (Logs)
Si el despliegue falla o recibes un error 500:
1.  Revisa los logs en tiempo real: `vercel logs --prod`.
2.  Verifica la conectividad de la base de datos: `vercel env pull .env.production` seguido de un test local.
