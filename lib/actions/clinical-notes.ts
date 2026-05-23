"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { clinicalNoteSchema, ClinicalNoteInput } from "../validations/clinical-note"
import { revalidatePath } from "next/cache"

export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Helper para verificar la sesión del usuario y validar permisos.
 * Retorna la sesión si es válida, o un error si no lo es.
 */
async function checkAuth(): Promise<{ session: any; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return { session: null, error: "No autorizado: Inicie sesión para continuar" }
  }

  const role = (session.user as any).role
  if (role === "Recepción") {
    return { session: null, error: "Acceso denegado: El rol de Recepción no tiene permitido acceder al historial clínico" }
  }

  return { session }
}

/**
 * Helper para verificar si un psicólogo está vinculado a un paciente.
 * Un psicólogo está vinculado si tiene al menos una cita con el paciente.
 */
async function isPsychologistLinkedToPatient(psychologistId: string, patientId: string): Promise<boolean> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      patientId,
      psychologistId,
    }
  })
  return !!appointment
}

/**
 * Server Action para registrar una nueva nota clínica estructurada.
 */
export async function createClinicalNote(formData: FormData): Promise<ActionResponse> {
  // 1. Verificar sesión y permisos (bloquear Recepción)
  const { session, error: authError } = await checkAuth()
  if (authError) {
    return { success: false, error: authError }
  }

  const user = session.user as any
  const userId = user.id
  const userRole = user.role

  // 2. Extraer datos del formulario
  const rawData = {
    patientId: (formData.get("patientId") as string) || "",
    sessionDate: (formData.get("sessionDate") as string) || "",
    sessionTime: (formData.get("sessionTime") as string) || "",
    duration: formData.get("duration") !== null && formData.get("duration") !== "" ? (formData.get("duration") as string) : undefined,
    reason: (formData.get("reason") as string) || "",
    observations: (formData.get("observations") as string) || "",
    emotionalState: (formData.get("emotionalState") as string) || "",
    actionPlan: (formData.get("actionPlan") as string) || "",
    nextSession: (formData.get("nextSession") as string) || "",
  }

  // 3. Validar con Zod
  const validation = clinicalNoteSchema.safeParse(rawData)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message
    }
  }

  const { patientId, sessionDate, sessionTime, duration, reason, observations, emotionalState, actionPlan, nextSession } = validation.data

  try {
    // 4. Aplicar restricción de confidencialidad para psicólogos
    if (userRole === "Psicología") {
      const isLinked = await isPsychologistLinkedToPatient(userId, patientId)
      if (!isLinked) {
        return {
          success: false,
          error: "Acceso denegado: Únicamente puede registrar notas para pacientes vinculados a sus citas"
        }
      }
    }

    // 5. Guardar en la base de datos
    const note = await prisma.clinicalNote.create({
      data: {
        patientId,
        psychologistId: userId,
        sessionDate,
        sessionTime,
        duration,
        reason,
        observations,
        emotionalState,
        actionPlan,
        nextSession: nextSession || null,
      }
    })

    // 6. Revalidar la ruta del historial
    revalidatePath("/dashboard/historial")

    return {
      success: true,
      data: note
    }
  } catch (error) {
    console.error("Error creating clinical note:", error)
    return {
      success: false,
      error: "Error interno al intentar registrar la sesión clínica"
    }
  }
}

/**
 * Server Action para obtener el listado histórico de notas de un paciente.
 */
export async function getClinicalNotesByPatient(patientId: string): Promise<ActionResponse<any[]>> {
  if (!patientId) {
    return { success: false, error: "El ID del paciente es requerido" }
  }

  // 1. Verificar sesión y permisos (bloquear Recepción)
  const { session, error: authError } = await checkAuth()
  if (authError) {
    return { success: false, error: authError }
  }

  const user = session.user as any
  const userId = user.id
  const userRole = user.role

  try {
    // 2. Aplicar restricción de confidencialidad para psicólogos
    if (userRole === "Psicología") {
      const isLinked = await isPsychologistLinkedToPatient(userId, patientId)
      if (!isLinked) {
        return {
          success: false,
          error: "Acceso denegado: No tiene permitido consultar el historial de un paciente no vinculado"
        }
      }
    }

    // 3. Consultar notas ordenadas cronológicamente por la fecha de sesión
    const notes = await prisma.clinicalNote.findMany({
      where: {
        patientId,
        ...(userRole === "Psicología" ? {
          patient: {
            appointments: {
              some: {
                psychologistId: userId
              }
            }
          }
        } : {})
      },
      include: {
        psychologist: {
          select: {
            fullName: true,
          }
        }
      },
      orderBy: {
        sessionDate: "desc"
      }
    })

    return {
      success: true,
      data: notes
    }
  } catch (error) {
    console.error("Error fetching clinical notes:", error)
    return {
      success: false,
      error: "Error interno al recuperar el historial clínico"
    }
  }
}

/**
 * Server Action para obtener la lista de pacientes vinculados al psicólogo actual (o todos si es Admin).
 */
export async function getLinkedPatients(): Promise<ActionResponse<any[]>> {
  // 1. Verificar sesión y permisos (bloquear Recepción)
  const { session, error: authError } = await checkAuth()
  if (authError) {
    return { success: false, error: authError }
  }

  const user = session.user as any
  const userId = user.id
  const userRole = user.role

  try {
    // Si es Administrador, puede ver todos los pacientes activos
    if (userRole === "Administración") {
      const patients = await prisma.patient.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          lastName: true,
        },
        orderBy: {
          name: "asc"
        }
      })
      return { success: true, data: patients }
    }

    // Si es Psicología, sólo ve pacientes vinculados a sus citas
    const appointments = await prisma.appointment.findMany({
      where: {
        psychologistId: userId,
        patient: { active: true }
      },
      select: {
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
          }
        }
      },
      distinct: ["patientId"]
    })

    const linkedPatients = appointments
      .map(app => app.patient)
      .filter(Boolean)
      .sort((a: any, b: any) => a.name.localeCompare(b.name))

    return {
      success: true,
      data: linkedPatients
    }
  } catch (error) {
    console.error("Error fetching linked patients:", error)
    return {
      success: false,
      error: "Error al recuperar los pacientes vinculados"
    }
  }
}
