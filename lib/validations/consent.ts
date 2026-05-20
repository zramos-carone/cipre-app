import { z } from "zod"

/**
 * Esquema de validación para la generación de un nuevo consentimiento informado.
 */
export const consentFormSchema = z.object({
  patientId: z.string({
    required_error: "Por favor, seleccione un paciente",
    invalid_type_error: "El ID del paciente debe ser una cadena válida",
  })
  .min(1, "Por favor, seleccione un paciente"),
  templateId: z.enum(["tratamiento", "datos", "evaluacion"], {
    errorMap: () => ({ message: "Por favor, seleccione una plantilla de consentimiento válida" }),
  }),
  date: z.string({
    required_error: "Por favor, seleccione una fecha válida",
  })
  .min(1, "Por favor, seleccione una fecha válida")
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha seleccionada no es válida",
  }),
})

export type ConsentFormInput = z.infer<typeof consentFormSchema>
