import { z } from "zod"

/**
 * Esquema de validación para la creación y edición de pacientes.
 */
export const patientSchema = z.object({
  fullName: z.string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres")
    .max(100, "El nombre completo es demasiado largo"),
  email: z.string()
    .email("Correo electrónico no válido")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .optional()
    .or(z.literal("")),
})

export type PatientInput = z.infer<typeof patientSchema>
