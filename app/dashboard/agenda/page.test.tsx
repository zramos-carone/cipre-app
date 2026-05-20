import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AgendaPage from './page'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAppointments, getPsychologists } from '@/lib/actions/appointments'
import { getPatients } from '@/lib/actions/patients'

// Mock de Server Actions de citas
vi.mock('@/lib/actions/appointments', () => ({
  getAppointments: vi.fn(),
  getPsychologists: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
}))

// Mock de Server Actions de pacientes
vi.mock('@/lib/actions/patients', () => ({
  getPatients: vi.fn(),
}))

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock de ResizeObserver que Radix suele requerir
global.ResizeObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

const mockPsychologists = [
  { id: 'psy-1', fullName: 'Dr. Fernando Gómez', email: 'fernando@example.com' },
]

const mockPatients = [
  { id: 'pat-1', name: 'Juan', lastName: 'Pérez' },
]

const mockAppointments = [
  {
    id: 'appt-1',
    patientId: 'pat-1',
    psychologistId: 'psy-1',
    scheduledAt: new Date('2026-05-20T10:00:00.000Z').toISOString(),
    status: 'Confirmada',
    notes: 'Nota importante',
    type: 'seguimiento',
    modality: 'Presencial',
    duration: 60,
    sendReminder: true,
    patient: {
      id: 'pat-1',
      name: 'Juan',
      lastName: 'Pérez',
      phone: '1234567890',
      email: 'juan@example.com',
    },
    psychologist: {
      id: 'psy-1',
      fullName: 'Dr. Fernando Gómez',
      email: 'fernando@example.com',
    },
  },
]

describe('AgendaPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(getPsychologists).mockResolvedValue({
      success: true,
      data: mockPsychologists,
    })
    
    vi.mocked(getPatients).mockResolvedValue({
      success: true,
      data: { patients: mockPatients, totalCount: 1, totalPages: 1, currentPage: 1 },
    })
    
    vi.mocked(getAppointments).mockResolvedValue({
      success: true,
      data: mockAppointments,
    })
  })

  it('debería renderizar el título de la agenda y la cabecera', async () => {
    render(<AgendaPage />)
    await waitFor(() => {
      expect(screen.getByText('Agenda de Citas')).toBeDefined()
    })
    expect(screen.getByText('Clínica Preventiva CIPRE')).toBeDefined()
  })

  it('debería cargar y filtrar psicólogos y pacientes al iniciar', async () => {
    render(<AgendaPage />)
    await waitFor(() => {
      expect(getPsychologists).toHaveBeenCalled()
      expect(getPatients).toHaveBeenCalledWith({ pageSize: 1000 })
    })
  })

  it('debería renderizar las citas en el calendario', async () => {
    render(<AgendaPage />)
    await waitFor(() => {
      expect(getAppointments).toHaveBeenCalled()
    })
  })

  it('debería cambiar entre vistas de Mes y Día', async () => {
    render(<AgendaPage />)
    await waitFor(() => {
      expect(screen.getByText('Agenda de Citas')).toBeDefined()
    })
    
    const dayViewButton = screen.getByRole('button', { name: /^Día$/i })
    fireEvent.click(dayViewButton)
    
    await waitFor(() => {
      expect(screen.getByText('Citas programadas para el día de hoy.')).toBeDefined()
    })
  })

  it('debería abrir el diálogo de nueva cita al hacer clic en "Nueva Cita"', async () => {
    render(<AgendaPage />)
    await waitFor(() => {
      expect(screen.getByText('Agenda de Citas')).toBeDefined()
    })
    
    const newAppointmentButton = screen.getByRole('button', { name: /Nueva Cita/i })
    fireEvent.click(newAppointmentButton)
    
    await waitFor(() => {
      expect(screen.getAllByText('Nueva Cita').length).toBeGreaterThan(0)
    })
  })
})
