"use server"

import prisma from "@/lib/prisma"
import { ActionResponse } from "./patients"

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
