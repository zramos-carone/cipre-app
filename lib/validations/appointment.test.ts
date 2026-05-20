import { describe, it, expect } from 'vitest'
import { appointmentSchema } from './appointment'

describe('Appointment Validation Schema', () => {
  const validAppointmentData = {
    patientId: 'patient-uuid-123',
    psychologistId: 'psychologist-uuid-456',
    scheduledAt: new Date('2026-05-20T10:00:00.000Z'),
    type: 'seguimiento',
    modality: 'Presencial',
    duration: 60,
    status: 'Pendiente',
    notes: 'Llevar expediente impreso.',
    sendReminder: true
  }

  it('debería validar correctamente una cita válida con todos los campos', () => {
    const result = appointmentSchema.safeParse(validAppointmentData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.patientId).toBe(validAppointmentData.patientId)
      expect(result.data.psychologistId).toBe(validAppointmentData.psychologistId)
      expect(result.data.scheduledAt).toBeInstanceOf(Date)
      expect(result.data.scheduledAt.toISOString()).toBe(validAppointmentData.scheduledAt.toISOString())
      expect(result.data.type).toBe('seguimiento')
      expect(result.data.modality).toBe('Presencial')
      expect(result.data.duration).toBe(60)
      expect(result.data.status).toBe('Pendiente')
      expect(result.data.notes).toBe('Llevar expediente impreso.')
      expect(result.data.sendReminder).toBe(true)
    }
  })

  it('debería aplicar valores por defecto para campos no provistos', () => {
    const minimalisticData = {
      patientId: 'patient-123',
      psychologistId: 'psy-456',
      scheduledAt: '2026-05-20T10:00:00.000Z'
    }
    const result = appointmentSchema.safeParse(minimalisticData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('seguimiento')
      expect(result.data.modality).toBe('Presencial')
      expect(result.data.duration).toBe(60)
      expect(result.data.status).toBe('Pendiente')
      expect(result.data.notes).toBeUndefined()
      expect(result.data.sendReminder).toBe(false)
    }
  })

  it('debería fallar si patientId está vacío', () => {
    const data = { ...validAppointmentData, patientId: '' }
    const result = appointmentSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Debe seleccionar un paciente')
    }
  })

  it('debería fallar si psychologistId está vacío', () => {
    const data = { ...validAppointmentData, psychologistId: '' }
    const result = appointmentSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Debe seleccionar un psicólogo')
    }
  })

  it('debería preprocesar correctamente una fecha en string ISO a objeto Date', () => {
    const data = {
      ...validAppointmentData,
      scheduledAt: '2026-05-20T15:30:00.000Z'
    }
    const result = appointmentSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.scheduledAt).toBeInstanceOf(Date)
      expect(result.data.scheduledAt.getUTCHours()).toBe(15)
      expect(result.data.scheduledAt.getUTCMinutes()).toBe(30)
    }
  })

  it('debería fallar si scheduledAt es inválida o vacía', () => {
    // Vacía
    const dataEmpty = { ...validAppointmentData, scheduledAt: '' }
    const resultEmpty = appointmentSchema.safeParse(dataEmpty)
    expect(resultEmpty.success).toBe(false)
    if (!resultEmpty.success) {
      expect(resultEmpty.error.errors[0].message).toBe('La fecha y hora son requeridas')
    }

    // Texto no-fecha
    const dataInvalid = { ...validAppointmentData, scheduledAt: 'no-es-una-fecha' }
    const resultInvalid = appointmentSchema.safeParse(dataInvalid)
    expect(resultInvalid.success).toBe(false)
    if (!resultInvalid.success) {
      expect(resultInvalid.error.errors[0].message).toBe('La fecha y hora son requeridas')
    }
  })

  it('debería validar tipos de cita permitidos y rechazar inválidos', () => {
    const types = ['primera', 'seguimiento', 'cierre']
    types.forEach(t => {
      const data = { ...validAppointmentData, type: t }
      expect(appointmentSchema.safeParse(data).success).toBe(true)
    })

    const dataInvalid = { ...validAppointmentData, type: 'grupal' }
    const result = appointmentSchema.safeParse(dataInvalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El tipo de cita no es válido')
    }
  })

  it('debería validar modalidades permitidas y rechazar inválidas', () => {
    const modalities = ['Presencial', 'En línea']
    modalities.forEach(m => {
      const data = { ...validAppointmentData, modality: m }
      expect(appointmentSchema.safeParse(data).success).toBe(true)
    })

    const dataInvalid = { ...validAppointmentData, modality: 'Telefonica' }
    const result = appointmentSchema.safeParse(dataInvalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La modalidad no es válida')
    }
  })

  it('debería preprocesar y validar la duración de la cita', () => {
    // String convertible
    const dataString = { ...validAppointmentData, duration: '45' }
    const resultString = appointmentSchema.safeParse(dataString)
    expect(resultString.success).toBe(true)
    if (resultString.success) {
      expect(resultString.data.duration).toBe(45)
    }

    // Cero (invalida)
    const dataZero = { ...validAppointmentData, duration: 0 }
    const resultZero = appointmentSchema.safeParse(dataZero)
    expect(resultZero.success).toBe(false)
    if (!resultZero.success) {
      expect(resultZero.error.errors[0].message).toBe('La duración debe ser de al menos 1 minuto')
    }

    // Negativa (invalida)
    const dataNegative = { ...validAppointmentData, duration: -15 }
    const resultNegative = appointmentSchema.safeParse(dataNegative)
    expect(resultNegative.success).toBe(false)
    if (!resultNegative.success) {
      expect(resultNegative.error.errors[0].message).toBe('La duración debe ser de al menos 1 minuto')
    }

    // Decimal (invalida)
    const dataDecimal = { ...validAppointmentData, duration: 45.5 }
    const resultDecimal = appointmentSchema.safeParse(dataDecimal)
    expect(resultDecimal.success).toBe(false)
    if (!resultDecimal.success) {
      expect(resultDecimal.error.errors[0].message).toBe('La duración debe ser un número entero')
    }
  })

  it('debería validar los estados permitidos de cita', () => {
    const statuses = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada']
    statuses.forEach(s => {
      const data = { ...validAppointmentData, status: s }
      expect(appointmentSchema.safeParse(data).success).toBe(true)
    })

    const dataInvalid = { ...validAppointmentData, status: 'Reagendada' }
    const result = appointmentSchema.safeParse(dataInvalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El estado de la cita no es válido')
    }
  })
})
