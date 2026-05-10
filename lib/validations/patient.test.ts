import { describe, it, expect } from 'vitest'
import { patientSchema } from './patient'

describe('Patient Validation Schema', () => {
  it('debería validar correctamente un paciente válido', () => {
    const validData = {
      fullName: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '1234567890'
    }
    const result = patientSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('debería permitir email y teléfono vacíos (opcionales)', () => {
    const data = {
      fullName: 'Juan Pérez',
      email: '',
      phone: ''
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('debería fallar si el nombre es demasiado corto', () => {
    const data = {
      fullName: 'Ju'
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El nombre completo debe tener al menos 3 caracteres')
    }
  })

  it('debería fallar si el email es inválido', () => {
    const data = {
      fullName: 'Juan Pérez',
      email: 'no-es-email'
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Correo electrónico no válido')
    }
  })

  it('debería fallar si el teléfono tiene menos de 10 dígitos', () => {
    const data = {
      fullName: 'Juan Pérez',
      phone: '123'
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El teléfono debe tener al menos 10 dígitos')
    }
  })
})
