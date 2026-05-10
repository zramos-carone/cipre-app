"use server"

import prisma from "@/lib/prisma"
import { patientSchema } from "@/lib/validations/patient"
import { revalidatePath } from "next/cache"

export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export type GetPatientsParams = {
  query?: string
  page?: number
  pageSize?: number
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

/**
 * Server Action para obtener el listado de pacientes con soporte para búsqueda y paginación.
 */
export async function getPatients({ 
  query = "", 
  page = 1, 
  pageSize = 10 
}: GetPatientsParams): Promise<ActionResponse> {
  const skip = (page - 1) * pageSize

  try {
    const where = {
      active: true,
      ...(query ? {
        OR: [
          { fullName: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query, mode: "insensitive" as const } },
        ]
      } : {})
    }

    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: (where as any),
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.patient.count({ where: (where as any) })
    ])

    return {
      success: true,
      data: {
        patients,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page
      }
    }
  } catch (error) {
    console.error("Error fetching patients:", error)
    return {
      success: false,
      error: "Error al obtener el listado de pacientes"
    }
  }
}

/**
 * Server Action para actualizar los datos de un paciente existente.
 */
export async function updatePatient(id: string, formData: FormData): Promise<ActionResponse> {
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
    // 2. Actualizar en la base de datos
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        fullName: validation.data.fullName,
        email: validation.data.email || null,
        phone: validation.data.phone || null,
      }
    })

    // 3. Revalidar la ruta del dashboard
    revalidatePath("/dashboard/pacientes")

    return {
      success: true,
      data: patient
    }
  } catch (error) {
    console.error("Error updating patient:", error)
    return {
      success: false,
      error: "Error interno al intentar actualizar el paciente"
    }
  }
}

/**
 * Server Action para desactivar un paciente (borrado lógico).
 */
export async function deletePatient(id: string): Promise<ActionResponse> {
  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: { active: false }
    })

    revalidatePath("/dashboard/pacientes")

    return {
      success: true,
      data: patient
    }
  } catch (error) {
    console.error("Error deleting patient:", error)
    return {
      success: false,
      error: "Error interno al intentar desactivar el paciente"
    }
  }
}
