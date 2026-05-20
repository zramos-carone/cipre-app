import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppointmentDialog } from './appointment-dialog'
import { describe, it, expect, vi } from 'vitest'

const mockPatients = [
  { id: 'pat-1', name: 'Juan', lastName: 'Pérez' },
  { id: 'pat-2', name: 'María', lastName: 'López' },
]

const mockPsychologists = [
  { id: 'psy-1', fullName: 'Dr. Fernando Gómez' },
  { id: 'psy-2', fullName: 'Dra. Laura Torres' },
]

// Mock de ScrollArea/ResizeObserver que Radix/Select o Popover suelen requerir
global.ResizeObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// Mock de pointer-events en Radix UI Dialog para evitar errores de jsdom
const originalPointerEvents = window.getComputedStyle

describe('AppointmentDialog & AppointmentForm', () => {
  it('debería renderizar "Nueva Cita" por defecto', () => {
    render(
      <AppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        patients={mockPatients}
        psychologists={mockPsychologists}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getAllByText('Nueva Cita').length).toBeGreaterThan(0)
    expect(screen.getByText('Completa el formulario para agendar una nueva cita en el sistema.')).toBeDefined()
  })

  it('debería renderizar "Editar Cita" cuando se proveen datos iniciales con ID', () => {
    const initialData = {
      id: 'appt-123',
      patientId: 'pat-1',
      psychologistId: 'psy-1',
      scheduledAt: new Date('2026-05-20T10:00:00'),
      type: 'seguimiento' as const,
      modality: 'Presencial' as const,
      duration: 60,
      status: 'Confirmada' as const,
      notes: 'Nota inicial',
      sendReminder: true,
    }

    render(
      <AppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        initialData={initialData}
        patients={mockPatients}
        psychologists={mockPsychologists}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getAllByText('Editar Cita').length).toBeGreaterThan(0)
    expect(screen.getByText('Modifica los detalles de la cita agendada a continuación.')).toBeDefined()
    expect(screen.getByDisplayValue('2026-05-20')).toBeDefined()
    expect(screen.getByDisplayValue('10:00')).toBeDefined()
    expect(screen.getByDisplayValue('60')).toBeDefined()
    expect(screen.getByDisplayValue('Nota inicial')).toBeDefined()
  })

  it('debería mostrar estado de carga al guardar', () => {
    render(
      <AppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        patients={mockPatients}
        psychologists={mockPsychologists}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />
    )

    expect(screen.getByText('Guardando...')).toBeDefined()
    expect(screen.getByRole('button', { name: /Guardando.../i })).toBeDisabled()
  })

  it('debería mostrar errores de validación si el formulario se envía vacío o incompleto', async () => {
    render(
      <AppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        patients={mockPatients}
        psychologists={mockPsychologists}
        onSubmit={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cita/i }))

    await waitFor(() => {
      expect(screen.getByText('Debe seleccionar un paciente')).toBeDefined()
      expect(screen.getByText('Debe seleccionar un psicólogo')).toBeDefined()
      expect(screen.getByText('La fecha es requerida')).toBeDefined()
      expect(screen.getByText('La hora es requerida')).toBeDefined()
    })
  })
})
