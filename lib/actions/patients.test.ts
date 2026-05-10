import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPatient, getPatients } from './patients'
import prisma from '@/lib/prisma'

// Mock de Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    patient: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
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

describe('Patient Server Actions - getPatients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar el listado de pacientes y el conteo total', async () => {
    const mockPatients = [{ id: '1', fullName: 'Juan' }, { id: '2', fullName: 'Maria' }]
    vi.mocked(prisma.patient.findMany).mockResolvedValue(mockPatients as any)
    vi.mocked(prisma.patient.count).mockResolvedValue(2)

    const result = await getPatients({ page: 1, pageSize: 10 })

    expect(result.success).toBe(true)
    expect(result.data.patients).toHaveLength(2)
    expect(result.data.totalCount).toBe(2)
    expect(result.data.totalPages).toBe(1)
  })

  it('debería aplicar el filtro de búsqueda correctamente', async () => {
    vi.mocked(prisma.patient.findMany).mockResolvedValue([])
    vi.mocked(prisma.patient.count).mockResolvedValue(0)

    await getPatients({ query: 'Juan' })

    expect(prisma.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([
          expect.objectContaining({ fullName: expect.any(Object) })
        ])
      })
    }))
  })

  it('debería calcular correctamente el skip para la paginación', async () => {
    vi.mocked(prisma.patient.findMany).mockResolvedValue([])
    vi.mocked(prisma.patient.count).mockResolvedValue(0)

    await getPatients({ page: 2, pageSize: 5 })

    expect(prisma.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 5,
      take: 5
    }))
  })
})
