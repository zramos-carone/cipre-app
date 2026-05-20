import { z } from "zod"

/**
 * Esquema de validación para la creación y edición de pacientes.
 */
export const patientSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),
  lastName: z.string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(50, "Los apellidos son demasiado largos"),
  birthDate: z.string()
    .optional()
    .or(z.literal("")),
  age: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0, "La edad no puede ser negativa").max(120, "La edad es inválida").optional()
  ),
  gender: z.enum(["Masculino", "Femenino", "Género No Binario", ""])
    .optional()
    .or(z.literal("")),
  address: z.string()
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Correo electrónico no válido")
    .optional()
    .or(z.literal("")),
  emergencyContact: z.string()
    .optional()
    .or(z.literal("")),
})

export type PatientInput = z.infer<typeof patientSchema>
