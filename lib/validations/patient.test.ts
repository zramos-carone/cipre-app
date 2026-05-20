import { describe, it, expect } from 'vitest'
import { patientSchema } from './patient'

describe('Patient Validation Schema', () => {
  it('debería validar correctamente un paciente válido con todos los campos', () => {
    const validData = {
      name: 'Juan',
      lastName: 'Pérez',
      birthDate: '1990-05-15',
      age: 36,
      gender: 'Masculino',
      address: 'Calle Falsa 123',
      email: 'juan@example.com',
      phone: '1234567890',
      emergencyContact: 'María Pérez - 9876543210'
    }
    const result = patientSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('debería permitir campos opcionales vacíos o ausentes', () => {
    const data = {
      name: 'Juan',
      lastName: 'Pérez',
      email: '',
      phone: ''
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('debería fallar si el nombre es demasiado corto', () => {
    const data = {
      name: 'J',
      lastName: 'Pérez'
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El nombre debe tener al menos 2 caracteres')
    }
  })

  it('debería fallar si los apellidos son demasiado cortos', () => {
    const data = {
      name: 'Juan',
      lastName: 'P'
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Los apellidos deben tener al menos 2 caracteres')
    }
  })

  it('debería fallar si el email es inválido', () => {
    const data = {
      name: 'Juan',
      lastName: 'Pérez',
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
      name: 'Juan',
      lastName: 'Pérez',
      phone: '123'
    }
    const result = patientSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El teléfono debe tener al menos 10 dígitos')
    }
  })

  it('debería preprocesar correctamente la edad y validar límites', () => {
    // Caso de edad como string convertible a número
    const dataStringAge = {
      name: 'Juan',
      lastName: 'Pérez',
      age: '25'
    }
    const resultString = patientSchema.safeParse(dataStringAge)
    expect(resultString.success).toBe(true)
    if (resultString.success) {
      expect(resultString.data.age).toBe(25)
    }

    // Caso de edad negativa (debe fallar)
    const dataNegativeAge = {
      name: 'Juan',
      lastName: 'Pérez',
      age: -5
    }
    const resultNegative = patientSchema.safeParse(dataNegativeAge)
    expect(resultNegative.success).toBe(false)

    // Caso de edad excesiva (debe fallar)
    const dataExcessiveAge = {
      name: 'Juan',
      lastName: 'Pérez',
      age: 150
    }
    const resultExcessive = patientSchema.safeParse(dataExcessiveAge)
    expect(resultExcessive.success).toBe(false)
  })
})
