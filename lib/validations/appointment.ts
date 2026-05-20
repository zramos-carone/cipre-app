import { z } from "zod"

/**
 * Esquema de validación para la creación y edición de citas.
 */
export const appointmentSchema = z.object({
  patientId: z.string()
    .min(1, "Debe seleccionar un paciente"),
  psychologistId: z.string()
    .min(1, "Debe seleccionar un psicólogo"),
  scheduledAt: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const parsed = typeof val === "string" || val instanceof Date ? new Date(val) : val;
      return parsed instanceof Date && isNaN(parsed.getTime()) ? undefined : parsed;
    },
    z.date({
      required_error: "La fecha y hora son requeridas",
      invalid_type_error: "Fecha y hora de cita inválidas"
    })
  ),
  type: z.enum(["primera", "seguimiento", "cierre"], {
    errorMap: () => ({ message: "El tipo de cita no es válido" })
  }).default("seguimiento"),
  modality: z.enum(["Presencial", "En línea"], {
    errorMap: () => ({ message: "La modalidad no es válida" })
  }).default("Presencial"),
  duration: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number()
      .int("La duración debe ser un número entero")
      .min(1, "La duración debe ser de al menos 1 minuto")
      .default(60)
  ),
  status: z.enum(["Pendiente", "Confirmada", "Completada", "Cancelada"], {
    errorMap: () => ({ message: "El estado de la cita no es válido" })
  }).default("Pendiente"),
  notes: z.string()
    .optional()
    .or(z.literal("")),
  sendReminder: z.boolean()
    .default(false),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
