import { z } from "zod"

/**
 * Esquema de validación para la creación y edición de notas clínicas (sesiones estructuradas).
 */
export const clinicalNoteSchema = z.object({
  patientId: z.string()
    .min(1, "Debe seleccionar un paciente"),
  sessionDate: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const parsed = typeof val === "string" || val instanceof Date ? new Date(val) : val;
      return parsed instanceof Date && isNaN(parsed.getTime()) ? undefined : parsed;
    },
    z.date({
      required_error: "La fecha de la sesión es requerida",
      invalid_type_error: "Fecha de sesión inválida"
    })
  ),
  sessionTime: z.string()
    .min(1, "La hora de la sesión es requerida")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La hora debe tener el formato HH:MM (24 horas)"),
  duration: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number()
      .int("La duración debe ser un número entero")
      .min(1, "La duración debe ser de al menos 1 minuto")
      .max(480, "La duración no puede exceder las 8 horas")
      .default(60)
  ),
  reason: z.string()
    .min(2, "El motivo de la consulta debe tener al menos 2 caracteres")
    .max(1000, "El motivo es demasiado largo"),
  observations: z.string()
    .min(2, "Las observaciones de la sesión deben tener al menos 2 caracteres"),
  emotionalState: z.string()
    .min(1, "El estado emocional observado es requerido")
    .max(100, "El estado emocional es demasiado largo"),
  actionPlan: z.string()
    .min(2, "El plan de acción debe tener al menos 2 caracteres"),
  nextSession: z.string()
    .max(200, "La sugerencia de la próxima cita es demasiado larga")
    .optional()
    .or(z.literal("")),
})

export type ClinicalNoteInput = z.infer<typeof clinicalNoteSchema>
