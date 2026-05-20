"use server"

import prisma from "@/lib/prisma"
import { ActionResponse } from "./patients"
import { appointmentSchema } from "../validations/appointment"
import { revalidatePath } from "next/cache"

/**
 * Valida la disponibilidad de un psicólogo en un intervalo de tiempo específico.
 * Retorna true si está disponible (sin conflictos), o false si hay un conflicto de agenda.
 * 
 * @param psychologistId ID del psicólogo a evaluar.
 * @param scheduledAt Fecha y hora de inicio propuestas para la cita.
 * @param duration Duración de la cita en minutos.
 * @param excludeAppointmentId (Opcional) ID de una cita existente a excluir (útil en ediciones).
 */
export async function checkPsychologistAvailability(
  psychologistId: string,
  scheduledAt: Date | string,
  duration: number,
  excludeAppointmentId?: string
): Promise<ActionResponse<boolean>> {
  try {
    if (!psychologistId) {
      return { success: false, error: "El psicólogo es requerido para verificar disponibilidad" }
    }

    const start = new Date(scheduledAt)
    if (isNaN(start.getTime())) {
      return { success: false, error: "La fecha y hora de la cita son inválidas" }
    }

    if (!duration || duration <= 0) {
      return { success: false, error: "La duración debe ser mayor a 0 minutos" }
    }

    const end = new Date(start.getTime() + duration * 60 * 1000)

    // Consultamos citas activas del psicólogo dentro de un rango razonable de 12 horas antes y después
    // para optimizar el rendimiento y evitar cargar todo el histórico.
    const startRange = new Date(start.getTime() - 12 * 60 * 60 * 1000)
    const endRange = new Date(start.getTime() + 12 * 60 * 60 * 1000)

    const activeAppointments = await prisma.appointment.findMany({
      where: {
        psychologistId,
        status: { not: "Cancelada" },
        scheduledAt: {
          gte: startRange,
          lte: endRange,
        },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
    })

    // Algoritmo de solapamiento dinámico:
    // Ocurre conflicto si (InicioA < FinB) Y (InicioB < FinA)
    const hasConflict = activeAppointments.some((app) => {
      const appStart = new Date(app.scheduledAt)
      const appEnd = new Date(appStart.getTime() + app.duration * 60 * 1000)

      return appStart < end && start < appEnd
    })

    return {
      success: true,
      data: !hasConflict, // Disponible si no hay conflicto
    }
  } catch (error: any) {
    console.error("Error checking psychologist availability:", error)
    return {
      success: false,
      error: "Ocurrió un error inesperado al verificar la disponibilidad"
    }
  }
}

/**
 * Server Action para registrar una nueva cita.
 */
export async function createAppointment(formData: FormData): Promise<ActionResponse> {
  try {
    const rawData = {
      patientId: (formData.get("patientId") as string) || "",
      psychologistId: (formData.get("psychologistId") as string) || "",
      scheduledAt: (formData.get("scheduledAt") as string) || "",
      type: (formData.get("type") as string) || undefined,
      modality: (formData.get("modality") as string) || undefined,
      duration: formData.get("duration") !== null && formData.get("duration") !== "" ? (formData.get("duration") as string) : undefined,
      status: (formData.get("status") as string) || undefined,
      notes: (formData.get("notes") as string) || "",
      sendReminder: formData.get("sendReminder") === "true" || formData.get("sendReminder") === "on",
    }

    // 1. Validar campos con Zod
    const validation = appointmentSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const { patientId, psychologistId, scheduledAt, type, modality, duration, status, notes, sendReminder } = validation.data

    // 2. Verificar la disponibilidad del psicólogo
    const availabilityResult = await checkPsychologistAvailability(psychologistId, scheduledAt, duration)
    if (!availabilityResult.success) {
      return {
        success: false,
        error: availabilityResult.error || "No se pudo verificar la disponibilidad del psicólogo"
      }
    }

    if (!availabilityResult.data) {
      return {
        success: false,
        error: "El psicólogo no está disponible en el horario seleccionado (choque de agenda)"
      }
    }

    // 3. Crear cita en la base de datos
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        psychologistId,
        scheduledAt,
        type,
        modality,
        duration,
        status,
        notes,
        sendReminder
      }
    })

    revalidatePath("/dashboard/agenda")

    return {
      success: true,
      data: appointment
    }
  } catch (error: any) {
    console.error("Error creating appointment:", error)
    return {
      success: false,
      error: "Error interno al intentar registrar la cita"
    }
  }
}

/**
 * Server Action para actualizar una cita existente.
 */
export async function updateAppointment(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    if (!id) {
      return { success: false, error: "El ID de la cita es requerido" }
    }

    // 1. Verificar si la cita existe
    const existing = await prisma.appointment.findUnique({
      where: { id }
    })
    if (!existing) {
      return { success: false, error: "La cita a actualizar no existe" }
    }

    const rawData = {
      patientId: (formData.get("patientId") as string) || "",
      psychologistId: (formData.get("psychologistId") as string) || "",
      scheduledAt: (formData.get("scheduledAt") as string) || "",
      type: (formData.get("type") as string) || undefined,
      modality: (formData.get("modality") as string) || undefined,
      duration: formData.get("duration") !== null && formData.get("duration") !== "" ? (formData.get("duration") as string) : undefined,
      status: (formData.get("status") as string) || undefined,
      notes: (formData.get("notes") as string) || "",
      sendReminder: formData.get("sendReminder") === "true" || formData.get("sendReminder") === "on",
    }

    // 2. Validar campos con Zod
    const validation = appointmentSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const { patientId, psychologistId, scheduledAt, type, modality, duration, status, notes, sendReminder } = validation.data

    // 3. Verificar disponibilidad (excluyendo la cita actual en edición)
    const availabilityResult = await checkPsychologistAvailability(psychologistId, scheduledAt, duration, id)
    if (!availabilityResult.success) {
      return {
        success: false,
        error: availabilityResult.error || "No se pudo verificar la disponibilidad del psicólogo"
      }
    }

    if (!availabilityResult.data) {
      return {
        success: false,
        error: "El psicólogo no está disponible en el horario seleccionado (choque de agenda)"
      }
    }

    // 4. Actualizar cita en la base de datos
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientId,
        psychologistId,
        scheduledAt,
        type,
        modality,
        duration,
        status,
        notes,
        sendReminder
      }
    })

    revalidatePath("/dashboard/agenda")

    return {
      success: true,
      data: appointment
    }
  } catch (error: any) {
    console.error("Error updating appointment:", error)
    return {
      success: false,
      error: "Error interno al intentar actualizar la cita"
    }
  }
}
