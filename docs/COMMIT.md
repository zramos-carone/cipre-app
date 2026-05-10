# 💬 Guía de Commits (Conventional Commits)

Este proyecto utiliza la convención de [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial de Git legible, profesional y fácil de rastrear. Esto es indispensable para construir nuestro `CHANGELOG.md` de forma organizada.

## 🎯 Estructura del Commit

```
<tipo>(<alcance opcional>): <descripción corta en minúsculas>

[cuerpo opcional detallando el porqué del cambio]
```

---

## 🏷️ Tipos Permitidos (Prefixes)

| Tipo       | Uso                                                                                                 | Ejemplo                                                  |
| ---------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `feat`     | Una nueva característica o funcionalidad.                                                           | `feat(checkout): integrar cupones de descuento`          |
| `fix`      | Solución a un bug o error.                                                                          | `fix(db): resolver conflicto de migraciones en postgres` |
| `chore`    | Tareas de mantenimiento, dependencias o configuración que no modifican código fuente de producción. | `chore(env): actualizar variables de neon db`            |
| `docs`     | Cambios exclusivos en la documentación (markdowns, README, Swagger).                                | `docs(swagger): añadir endpoint de mayoristas`           |
| `style`    | Cambios estéticos de código que no afectan el significado (espacios, formato, comas, prettier).     | `style(ui): aplicar glassmorphism en el header`          |
| `refactor` | Cambio de código que ni arregla un bug ni añade una feature, solo mejora la estructura interna.     | `refactor(auth): aislar lógica de NextAuth en lib/`      |
| `test`     | Añadir pruebas faltantes o corregir pruebas existentes.                                             | `test(e2e): añadir prueba de flujo de paypal`            |
| `perf`     | Un cambio de código que mejora el rendimiento o tiempos de carga.                                   | `perf(images): implementar lazy loading con next/image`  |
