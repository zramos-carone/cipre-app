"use server"

import prisma from "@/lib/prisma"
import { uploadFile } from "@/lib/storage"
import { revalidatePath } from "next/cache"
import { consentFormSchema } from "@/lib/validations/consent"

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

/**
 * Server Action para alternar (firmar/desfirmar) el estado de firma de un consentimiento.
 */
export async function toggleConsentSignature(id: string, isSigned: boolean): Promise<ActionResponse> {
  if (!id) {
    return {
      success: false,
      error: "El ID del consentimiento es requerido"
    }
  }

  try {
    const updatedConsent = await prisma.informedConsent.update({
      where: { id },
      data: {
        isSigned,
        signedAt: isSigned ? new Date() : null
      }
    })

    revalidatePath("/dashboard/consentimientos")
    revalidatePath("/dashboard/pacientes")

    return {
      success: true,
      data: updatedConsent
    }
  } catch (error) {
    console.error("Error in toggleConsentSignature:", error)
    return {
      success: false,
      error: "Error interno al actualizar el estado de firma"
    }
  }
}

/**
 * Server Action para generar un consentimiento informado en la base de datos de Prisma.
 */
export async function generateInformedConsent(data: {
  patientId: string
  templateId: string
  date: string
}): Promise<ActionResponse> {
  // 1. Validar usando consentFormSchema
  const validation = consentFormSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    }
  }

  const { patientId, templateId } = validation.data

  try {
    // 2. Verificar que el paciente exista
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { informedConsent: true }
    })

    if (!patient) {
      return {
        success: false,
        error: "El paciente especificado no existe en el sistema"
      }
    }

    // 3. Verificar si el paciente ya tiene un consentimiento
    if (patient.informedConsent) {
      return {
        success: false,
        error: "El paciente ya tiene un consentimiento informado registrado"
      }
    }

    // 4. Crear el registro en la base de datos
    // Usamos la plantilla en el path para poder deducir el título
    const consent = await prisma.informedConsent.create({
      data: {
        patientId,
        documentUrl: `/uploads/${templateId}.pdf`,
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
    console.error("Error in generateInformedConsent:", error)
    return {
      success: false,
      error: "Error interno al generar el consentimiento informado"
    }
  }
}

