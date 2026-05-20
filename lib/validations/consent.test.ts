import { describe, it, expect } from 'vitest'
import { consentFormSchema } from './consent'

describe('Consent Validation Schema', () => {
  it('debería validar correctamente un consentimiento válido con todos los campos', () => {
    const validData = {
      patientId: 'patient-uuid-1234',
      templateId: 'tratamiento',
      date: '2026-05-20',
    }
    const result = consentFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('debería fallar si falta el ID del paciente', () => {
    const data = {
      patientId: '',
      templateId: 'tratamiento',
      date: '2026-05-20',
    }
    const result = consentFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Por favor, seleccione un paciente')
    }
  })

  it('debería fallar si falta la plantilla de consentimiento o es inválida', () => {
    const dataMissing = {
      patientId: 'patient-uuid-1234',
      templateId: '',
      date: '2026-05-20',
    }
    const resultMissing = consentFormSchema.safeParse(dataMissing)
    expect(resultMissing.success).toBe(false)

    const dataInvalid = {
      patientId: 'patient-uuid-1234',
      templateId: 'invalido',
      date: '2026-05-20',
    }
    const resultInvalid = consentFormSchema.safeParse(dataInvalid)
    expect(resultInvalid.success).toBe(false)
    if (!resultInvalid.success) {
      expect(resultInvalid.error.errors[0].message).toBe('Por favor, seleccione una plantilla de consentimiento válida')
    }
  })

  it('debería fallar si falta la fecha o no es una fecha válida', () => {
    const dataMissing = {
      patientId: 'patient-uuid-1234',
      templateId: 'tratamiento',
      date: '',
    }
    const resultMissing = consentFormSchema.safeParse(dataMissing)
    expect(resultMissing.success).toBe(false)
    if (!resultMissing.success) {
      expect(resultMissing.error.errors[0].message).toBe('Por favor, seleccione una fecha válida')
    }

    const dataInvalid = {
      patientId: 'patient-uuid-1234',
      templateId: 'tratamiento',
      date: 'fecha-invalida',
    }
    const resultInvalid = consentFormSchema.safeParse(dataInvalid)
    expect(resultInvalid.success).toBe(false)
    if (!resultInvalid.success) {
      expect(resultInvalid.error.errors[0].message).toBe('La fecha seleccionada no es válida')
    }
  })
})
