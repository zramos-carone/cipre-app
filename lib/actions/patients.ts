"use server"

import prisma from "@/lib/prisma"
import { patientSchema } from "@/lib/validations/patient"
import { revalidatePath } from "next/cache"

export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action para registrar un nuevo paciente.
 */
export async function createPatient(formData: FormData): Promise<ActionResponse> {
  const rawData = {
    fullName: (formData.get("fullName") as string) || "",
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
  }

  // 1. Validar datos con Zod
  const validation = patientSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message
    }
  }

  try {
    // 2. Guardar en la base de datos
    const patient = await prisma.patient.create({
      data: {
        fullName: validation.data.fullName,
        email: validation.data.email || null,
        phone: validation.data.phone || null,
      }
    })

    // 3. Revalidar la ruta del dashboard de pacientes
    revalidatePath("/dashboard/pacientes")

    return {
      success: true,
      data: patient
    }
  } catch (error) {
    console.error("Error creating patient:", error)
    return {
      success: false,
      error: "Error interno al intentar registrar el paciente"
    }
  }
}
