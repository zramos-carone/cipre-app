# Estrategia de Pruebas (Testing) - CIPRE

Este documento define los lineamientos de aseguramiento de calidad (QA) y pruebas automatizadas para el proyecto CIPRE. La integridad de los datos clínicos y la lógica operativa requieren un rigor técnico absoluto.

## 📏 Regla de Oro: Pruebas 1 a 1 (Validation-Driven)
Por cada **Task** ejecutada o por cada **Feature** desarrollado, es **obligatorio** crear una validación o prueba unitaria correspondiente antes de dar la tarea por concluida. 

* 1 Task o Función Nueva = 1 Test unitario correspondiente.
* Código sin pruebas o sin validación = Código **NO** terminado.

## 🛠️ Stack de Pruebas Recomendado

Para mantener la estabilidad en nuestro ecosistema de Next.js y React, se utilizarán las siguientes herramientas:

1. **Vitest o Jest**: Para pruebas unitarias lógicas.
   - Ideal para probar Server Actions, middlewares de RBAC y lógica transaccional (ej. asegurar que el cálculo de devoluciones en `Refund` sea exacto).
2. **React Testing Library**: Para pruebas de componentes visuales.
   - Utilizado para asegurar que los formularios (ej. creación de pacientes) validen correctamente los campos y respondan a las interacciones del usuario.
3. **Playwright / Cypress** (Para Fases Avanzadas): Para pruebas End-to-End (E2E).
   - Diseñado para flujos críticos completos (Ej. "Un psicólogo hace login, navega a la agenda, y redacta una nota clínica").

## 📝 Nomenclatura y Estructura
Los archivos de pruebas deben estar colocados estratégicamente junto al código que evalúan, utilizando el sufijo `.test.ts` o `.test.tsx`.

*Ejemplo:*
- Código fuente: `actions/createPatient.ts`
- Archivo de prueba: `actions/createPatient.test.ts`

## 🚦 Flujo de Trabajo (TDD / Test-Driven Development)
Si es posible, sigue esta metodología al atacar las tareas del `PLANNING.md`:
1. Escribir primero el Test que defina el resultado esperado de la Tarea.
2. Ejecutar la prueba (debe fallar).
3. Desarrollar la funcionalidad mínima para que el código pase la prueba exitosamente.
4. Refactorizar y limpiar el código.
5. Hacer el commit hacia el repositorio.
