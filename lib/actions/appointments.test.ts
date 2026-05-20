import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { checkPsychologistAvailability } from './appointments'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    appointment: {
      findMany: vi.fn(),
    },
  },
}))

describe('Appointments Server Actions - checkPsychologistAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('debería retornar disponible si no hay citas previas en la base de datos', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    const result = await checkPsychologistAvailability(
      'psy-123',
      '2026-05-20T10:00:00.000Z',
      60
    )

    expect(result.success).toBe(true)
    expect(result.data).toBe(true) // Disponible
    expect(prisma.appointment.findMany).toHaveBeenCalled()
  })

  it('debería retornar disponible si las citas existentes no solapan en tiempo', async () => {
    const existingAppointments = [
      {
        id: 'app-1',
        psychologistId: 'psy-123',
        patientId: 'pat-1',
        scheduledAt: new Date('2026-05-20T09:00:00.000Z'), // 9:00 a 10:00
        duration: 60,
        status: 'Pendiente',
      },
      {
        id: 'app-2',
        psychologistId: 'psy-123',
        patientId: 'pat-2',
        scheduledAt: new Date('2026-05-20T11:00:00.000Z'), // 11:00 a 12:00
        duration: 60,
        status: 'Pendiente',
      }
    ]
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(existingAppointments as any)

    // Cita propuesta: 10:00 a 11:00
    const result = await checkPsychologistAvailability(
      'psy-123',
      '2026-05-20T10:00:00.000Z',
      60
    )

    expect(result.success).toBe(true)
    expect(result.data).toBe(true) // Disponible
  })

  it('debería retornar no disponible si hay una cita activa que solapa (solapamiento exacto)', async () => {
    const existingAppointments = [
      {
        id: 'app-1',
        psychologistId: 'psy-123',
        patientId: 'pat-1',
        scheduledAt: new Date('2026-05-20T10:00:00.000Z'), // 10:00 a 11:00
        duration: 60,
        status: 'Pendiente',
      }
    ]
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(existingAppointments as any)

    // Cita propuesta: 10:00 a 11:00
    const result = await checkPsychologistAvailability(
      'psy-123',
      '2026-05-20T10:00:00.000Z',
      60
    )

    expect(result.success).toBe(true)
    expect(result.data).toBe(false) // Conflicto detectado
  })

  it('debería retornar no disponible si hay una cita activa que solapa parcialmente', async () => {
    const existingAppointments = [
      {
        id: 'app-1',
        psychologistId: 'psy-123',
        patientId: 'pat-1',
        scheduledAt: new Date('2026-05-20T09:30:00.000Z'), // 09:30 a 10:30
        duration: 60,
        status: 'Pendiente',
      }
    ]
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(existingAppointments as any)

    // Cita propuesta: 10:00 a 11:00
    const result = await checkPsychologistAvailability(
      'psy-123',
      '2026-05-20T10:00:00.000Z',
      60
    )

    expect(result.success).toBe(true)
    expect(result.data).toBe(false) // Conflicto detectado
  })

  it('debería permitir ignorar una cita en conflicto si coincide con excludeAppointmentId', async () => {
    const existingAppointments = [
      {
        id: 'app-123',
        psychologistId: 'psy-123',
        patientId: 'pat-1',
        scheduledAt: new Date('2026-05-20T10:00:00.000Z'), // 10:00 a 11:00
        duration: 60,
        status: 'Pendiente',
      }
    ]
    // prisma.findMany está mockeado para no incluir el excludeAppointmentId debido a la cláusula `not` de Prisma.
    // Simulamos esta exclusión de Prisma retornando una lista vacía.
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    // Cita propuesta: 10:00 a 11:00 excluyendo la misma cita "app-123"
    const result = await checkPsychologistAvailability(
      'psy-123',
      '2026-05-20T10:00:00.000Z',
      60,
      'app-123'
    )

    expect(result.success).toBe(true)
    expect(result.data).toBe(true) // Disponible
  })

  it('debería fallar si los parámetros requeridos no son válidos', async () => {
    // Sin psicólogo
    const resultNoPsy = await checkPsychologistAvailability('', '2026-05-20T10:00:00.000Z', 60)
    expect(resultNoPsy.success).toBe(false)
    expect(resultNoPsy.error).toBe('El psicólogo es requerido para verificar disponibilidad')

    // Fecha inválida
    const resultBadDate = await checkPsychologistAvailability('psy-123', 'fecha-invalida', 60)
    expect(resultBadDate.success).toBe(false)
    expect(resultBadDate.error).toBe('La fecha y hora de la cita son inválidas')

    // Duración no válida (0)
    const resultZeroDur = await checkPsychologistAvailability('psy-123', '2026-05-20T10:00:00.000Z', 0)
    expect(resultZeroDur.success).toBe(false)
    expect(resultZeroDur.error).toBe('La duración debe ser mayor a 0 minutos')
  })

  it('debería capturar errores inesperados de la base de datos', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(prisma.appointment.findMany).mockRejectedValue(new Error('Prisma Connection Failure'))

    const result = await checkPsychologistAvailability(
      'psy-123',
      '2026-05-20T10:00:00.000Z',
      60
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ocurrió un error inesperado al verificar la disponibilidad')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
