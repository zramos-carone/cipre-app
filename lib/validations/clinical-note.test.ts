import { describe, it, expect } from 'vitest'
import { clinicalNoteSchema } from './clinical-note'

describe('ClinicalNote Validation Schema', () => {
  it('debería validar correctamente una nota clínica válida con todos los campos requeridos', () => {
    const validData = {
      patientId: 'patient-uuid-123',
      sessionDate: new Date('2026-05-23'),
      sessionTime: '14:30',
      duration: 50,
      reason: 'Paciente reporta ansiedad ante exámenes.',
      observations: 'Se aplica técnica de reestructuración cognitiva.',
      emotionalState: 'Ansioso y tenso al inicio, más calmado al cierre.',
      actionPlan: 'Ejercicios de respiración diafragmática 3 veces al día.',
      nextSession: 'En 7 días',
    }
    const result = clinicalNoteSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('debería fallar si falta el patientId', () => {
    const invalidData = {
      patientId: '',
      sessionDate: new Date('2026-05-23'),
      sessionTime: '14:30',
      duration: 50,
      reason: 'Motivo',
      observations: 'Observaciones',
      emotionalState: 'Estado',
      actionPlan: 'Plan',
    }
    const result = clinicalNoteSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Debe seleccionar un paciente')
    }
  })

  it('debería fallar si la hora no tiene formato HH:MM (24 horas)', () => {
    const invalidData = {
      patientId: 'patient-uuid-123',
      sessionDate: new Date('2026-05-23'),
      sessionTime: '25:70', // Hora y minutos inválidos
      duration: 50,
      reason: 'Motivo',
      observations: 'Observaciones',
      emotionalState: 'Estado',
      actionPlan: 'Plan',
    }
    const result = clinicalNoteSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La hora debe tener el formato HH:MM (24 horas)')
    }
  })

  it('debería fallar si la duración es menor a 1', () => {
    const invalidData = {
      patientId: 'patient-uuid-123',
      sessionDate: new Date('2026-05-23'),
      sessionTime: '14:30',
      duration: 0,
      reason: 'Motivo',
      observations: 'Observaciones',
      emotionalState: 'Estado',
      actionPlan: 'Plan',
    }
    const result = clinicalNoteSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La duración debe ser de al menos 1 minuto')
    }
  })

  it('debería fallar si los campos obligatorios de texto están vacíos o son muy cortos', () => {
    const invalidData = {
      patientId: 'patient-uuid-123',
      sessionDate: new Date('2026-05-23'),
      sessionTime: '14:30',
      duration: 50,
      reason: 'a', // muy corto
      observations: '', // vacío
      emotionalState: '', // vacío
      actionPlan: 'Plan',
    }
    const result = clinicalNoteSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    
    // Debería tener múltiples errores
    if (!result.success) {
      const messages = result.error.errors.map(err => err.message)
      expect(messages).toContain('El motivo de la consulta debe tener al menos 2 caracteres')
      expect(messages).toContain('Las observaciones de la sesión deben tener al menos 2 caracteres')
      expect(messages).toContain('El estado emocional observado es requerido')
    }
  })
})
