import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { 
  checkPsychologistAvailability,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointments,
  getPsychologists
} from './appointments'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    appointment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

describe('Appointments Server Actions - createAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería crear una cita exitosamente con datos válidos', async () => {
    const formData = new FormData()
    formData.append('patientId', 'pat-123')
    formData.append('psychologistId', 'psy-123')
    formData.append('scheduledAt', '2026-05-20T10:00:00.000Z')
    formData.append('type', 'seguimiento')
    formData.append('modality', 'Presencial')
    formData.append('duration', '60')
    formData.append('status', 'Pendiente')
    formData.append('notes', 'Nota de prueba')
    formData.append('sendReminder', 'true')

    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]) // Disponible
    vi.mocked(prisma.appointment.create).mockResolvedValue({
      id: 'app-abc',
      patientId: 'pat-123',
      psychologistId: 'psy-123',
      scheduledAt: new Date('2026-05-20T10:00:00.000Z'),
      duration: 60,
    } as any)

    const result = await createAppointment(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(prisma.appointment.create).toHaveBeenCalled()
  })

  it('debería fallar si los datos no superan la validación de Zod', async () => {
    const formData = new FormData()
    formData.append('patientId', '') // Inválido
    formData.append('psychologistId', 'psy-123')
    formData.append('scheduledAt', 'fecha-invalida')

    const result = await createAppointment(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(prisma.appointment.create).not.toHaveBeenCalled()
  })

  it('debería fallar si el psicólogo no está disponible (choque de agenda)', async () => {
    const formData = new FormData()
    formData.append('patientId', 'pat-123')
    formData.append('psychologistId', 'psy-123')
    formData.append('scheduledAt', '2026-05-20T10:00:00.000Z')
    formData.append('type', 'seguimiento')
    formData.append('modality', 'Presencial')
    formData.append('duration', '60')

    // Conflicto: devolvemos una cita que solapa
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: 'existing-app',
        scheduledAt: new Date('2026-05-20T10:30:00.000Z'),
        duration: 60,
      }
    ] as any)

    const result = await createAppointment(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('El psicólogo no está disponible en el horario seleccionado (choque de agenda)')
    expect(prisma.appointment.create).not.toHaveBeenCalled()
  })

  it('debería manejar errores inesperados de la base de datos', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const formData = new FormData()
    formData.append('patientId', 'pat-123')
    formData.append('psychologistId', 'psy-123')
    formData.append('scheduledAt', '2026-05-20T10:00:00.000Z')
    formData.append('duration', '60')

    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])
    vi.mocked(prisma.appointment.create).mockRejectedValue(new Error('Prisma error'))

    const result = await createAppointment(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Error interno al intentar registrar la cita')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('Appointments Server Actions - updateAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería actualizar una cita exitosamente', async () => {
    const formData = new FormData()
    formData.append('patientId', 'pat-123')
    formData.append('psychologistId', 'psy-123')
    formData.append('scheduledAt', '2026-05-20T10:00:00.000Z')
    formData.append('type', 'seguimiento')
    formData.append('modality', 'Presencial')
    formData.append('duration', '60')

    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({ id: 'app-abc' } as any)
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]) // Disponible
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      id: 'app-abc',
      patientId: 'pat-123',
    } as any)

    const result = await updateAppointment('app-abc', formData)

    expect(result.success).toBe(true)
    expect(prisma.appointment.update).toHaveBeenCalled()
  })

  it('debería fallar si la cita no existe', async () => {
    const formData = new FormData()
    formData.append('patientId', 'pat-123')
    formData.append('psychologistId', 'psy-123')
    formData.append('scheduledAt', '2026-05-20T10:00:00.000Z')

    vi.mocked(prisma.appointment.findUnique).mockResolvedValue(null)

    const result = await updateAppointment('non-existent', formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('La cita a actualizar no existe')
  })

  it('debería fallar si los datos no superan la validación de Zod', async () => {
    const formData = new FormData()
    formData.append('patientId', '') // Inválido

    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({ id: 'app-abc' } as any)

    const result = await updateAppointment('app-abc', formData)

    expect(result.success).toBe(false)
    expect(prisma.appointment.update).not.toHaveBeenCalled()
  })
})

describe('Appointments Server Actions - cancelAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería cambiar el estado a Cancelada exitosamente', async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({ id: 'app-abc' } as any)
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      id: 'app-abc',
      status: 'Cancelada',
    } as any)

    const result = await cancelAppointment('app-abc')

    expect(result.success).toBe(true)
    expect(result.data.status).toBe('Cancelada')
    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: 'app-abc' },
      data: { status: 'Cancelada' }
    })
  })

  it('debería fallar si la cita a cancelar no existe', async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue(null)

    const result = await cancelAppointment('non-existent')

    expect(result.success).toBe(false)
    expect(result.error).toBe('La cita a cancelar no existe')
  })
})

describe('Appointments Server Actions - getAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería obtener la lista completa de citas sin filtros', async () => {
    const mockAppointments = [
      { id: '1', scheduledAt: new Date(), patient: { name: 'Juan' } }
    ]
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockAppointments as any)

    const result = await getAppointments()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: {},
      include: expect.any(Object),
      orderBy: { scheduledAt: 'asc' },
    })
  })

  it('debería aplicar filtros de psicólogo y tipo si se proveen', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    await getAppointments({ psychologistId: 'psy-123', type: 'cierre' })

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: {
        psychologistId: 'psy-123',
        type: 'cierre',
      },
      include: expect.any(Object),
      orderBy: { scheduledAt: 'asc' },
    })
  })

  it('debería aplicar filtros de rango de fechas', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    const start = '2026-05-20T00:00:00.000Z'
    const end = '2026-05-20T23:59:59.000Z'
    await getAppointments({ startDate: start, endDate: end })

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: {
        scheduledAt: {
          gte: new Date(start),
          lte: new Date(end),
        }
      },
      include: expect.any(Object),
      orderBy: { scheduledAt: 'asc' },
    })
  })

  it('debería aplicar filtro de búsqueda de paciente', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    await getAppointments({ query: 'Pérez' })

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: {
        patient: {
          OR: [
            { name: { contains: 'Pérez', mode: 'insensitive' } },
            { lastName: { contains: 'Pérez', mode: 'insensitive' } },
          ]
        }
      },
      include: expect.any(Object),
      orderBy: { scheduledAt: 'asc' },
    })
  })
})

describe('Appointments Server Actions - getPsychologists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería obtener la lista de psicólogos activos exitosamente', async () => {
    const mockUsers = [
      { id: 'usr-1', fullName: 'Dra. Amanda', email: 'amanda@example.com' }
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any)

    const result = await getPsychologists()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        active: true,
        role: {
          name: 'Psicología'
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: {
        fullName: 'asc'
      }
    })
  })

  it('debería manejar errores de base de datos en getPsychologists', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('Prisma database down'))

    const result = await getPsychologists()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Error interno al intentar recuperar los psicólogos')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

