"use server"

import prisma from "@/lib/prisma"
import { uploadFile } from "@/lib/storage"
import { revalidatePath } from "next/cache"

export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action para subir un PDF de consentimiento y enlazarlo a un paciente (upsert 1-1).
 */
export async function uploadInformedConsent(formData: FormData): Promise<ActionResponse> {
  const patientId = formData.get("patientId") as string
  const file = formData.get("file") as File | null

  if (!patientId) {
    return {
      success: false,
      error: "El ID del paciente es requerido"
    }
  }

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "Debe seleccionar un archivo PDF válido"
    }
  }

  try {
    // 1. Verificar que el paciente exista
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return {
        success: false,
        error: "El paciente especificado no existe en el sistema"
      }
    }

    // 2. Subir el archivo usando nuestro utility de storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `consentimiento-${patientId}-${Date.now()}.pdf`
    const documentUrl = await uploadFile(filename, buffer, "application/pdf")

    // 3. Crear o actualizar (upsert) el registro de consentimiento en la base de datos
    const consent = await prisma.informedConsent.upsert({
      where: { patientId },
      update: {
        documentUrl,
        isSigned: false,
        signedAt: null,
      },
      create: {
        patientId,
        documentUrl,
        isSigned: false,
      }
    })

    revalidatePath("/dashboard/consentimientos")
    revalidatePath("/dashboard/pacientes")

    return {
      success: true,
      data: consent
    }
  } catch (error) {
    console.error("Error in uploadInformedConsent:", error)
    return {
      success: false,
      error: "Error interno al subir el consentimiento informado"
    }
  }
}

/**
 * Server Action para obtener el listado de todos los consentimientos de la base de datos.
 */
export async function getInformedConsents(): Promise<ActionResponse> {
  try {
    const consents = await prisma.informedConsent.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    })
    return {
      success: true,
      data: consents
    }
  } catch (error) {
    console.error("Error in getInformedConsents:", error)
    return {
      success: false,
      error: "Error al obtener el listado de consentimientos"
    }
  }
}
