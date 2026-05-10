import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPatient } from './patients'
import prisma from '@/lib/prisma'

// Mock de Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    patient: {
      create: vi.fn(),
    },
  },
}))

// Mock de next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Patient Server Actions - createPatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería crear un paciente exitosamente con datos válidos', async () => {
    const formData = new FormData()
    formData.append('fullName', 'Juan Pérez')
    formData.append('email', 'juan@example.com')
    formData.append('phone', '1234567890')

    const mockPatient = { id: '1', fullName: 'Juan Pérez' }
    vi.mocked(prisma.patient.create).mockResolvedValue(mockPatient as any)

    const result = await createPatient(formData)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockPatient)
    expect(prisma.patient.create).toHaveBeenCalled()
  })

  it('debería retornar error si la validación falla (nombre corto)', async () => {
    const formData = new FormData()
    formData.append('fullName', 'Ju')

    const result = await createPatient(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('El nombre completo debe tener al menos 3 caracteres')
    expect(prisma.patient.create).not.toHaveBeenCalled()
  })

  it('debería manejar errores de la base de datos', async () => {
    const formData = new FormData()
    formData.append('fullName', 'Juan Pérez')

    vi.mocked(prisma.patient.create).mockRejectedValue(new Error('DB Error'))

    const result = await createPatient(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Error interno al intentar registrar el paciente')
  })
})
