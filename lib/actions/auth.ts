"use server"

import { z } from "zod"

// Esquema de validación para el Login
const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(1, "La contraseña es obligatoria")
})

export type LoginActionResponse = {
  success: boolean
  error?: string
  data?: {
    email: string
  }
}

/**
 * Server Action para validar los datos de inicio de sesión.
 * En NextAuth v4, este servidor valida y retorna el permiso para proceder con signIn en el cliente.
 */
export async function loginAction(formData: FormData): Promise<LoginActionResponse> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const validation = loginSchema.safeParse({ email, password })

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message
    }
  }

  // Aquí se podrían agregar logs de auditoría o verificaciones de seguridad extra (Rate Limiting, etc.)
  
  return {
    success: true,
    data: { email: validation.data.email }
  }
}
