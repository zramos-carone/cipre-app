import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HistorialClinicoPage from './page'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSession } from 'next-auth/react'
import { getLinkedPatients, getClinicalNotesByPatient } from '@/lib/actions/clinical-notes'

// Mock de next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

// Mock de Server Actions
vi.mock('@/lib/actions/clinical-notes', () => ({
  getLinkedPatients: vi.fn(),
  getClinicalNotesByPatient: vi.fn(),
  createClinicalNote: vi.fn(),
}))

// Mock de ScrollArea/ResizeObserver
global.ResizeObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.HTMLElement.prototype.scrollIntoView = vi.fn()


const mockPatients = [
  { id: 'pat-1', name: 'María', lastName: 'González' },
  { id: 'pat-2', name: 'Juan', lastName: 'Pérez' },
]

const mockNotes = [
  {
    id: 'note-1',
    sessionDate: '2026-05-23T15:00:00.000Z',
    sessionTime: '15:00',
    duration: 50,
    emotionalState: 'Estable',
    reason: 'Motivo de consulta original',
    observations: 'Avance notable',
    actionPlan: 'Ejercicios diarios',
    nextSession: 'Próxima semana',
    psychologist: { fullName: 'Dr. Fernando Gómez' },
  }
]

describe('HistorialClinicoPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock de sesión por defecto
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Dr. Fernando Gómez', role: 'Psicología' } },
      status: 'authenticated',
    } as any)

    // Mocks de Server Actions
    vi.mocked(getLinkedPatients).mockResolvedValue({ success: true, data: mockPatients })
    vi.mocked(getClinicalNotesByPatient).mockResolvedValue({ success: true, data: mockNotes })
  })

  it('debería renderizar la cabecera y el estado vacío inicial', async () => {
    render(<HistorialClinicoPage />)

    expect(screen.getByText('Historial Clínico')).toBeDefined()
    expect(screen.getByText('Ningún paciente seleccionado')).toBeDefined()
    expect(screen.getByText('Por favor, seleccione un paciente de la lista superior para desplegar su expediente e historial clínico de sesiones.')).toBeDefined()
    
    await waitFor(() => {
      expect(getLinkedPatients).toHaveBeenCalled()
    })
  })

  it('debería cargar y mostrar las notas al seleccionar un paciente', async () => {
    render(<HistorialClinicoPage />)

    // Esperar a que carguen los pacientes
    await screen.findByText('Seleccione un paciente')

    // Simulamos la selección de un paciente (seleccionamos María González)
    // Para simplificar el test de Select en JSDOM, simulamos el seteo del valor directamente
    // o forzamos la llamada al evento si el selector está renderizado.
    // Como Radix Select es complejo en jsdom, podemos interactuar con él abriéndolo:
    const selectTrigger = screen.getByRole('combobox')
    fireEvent.click(selectTrigger)

    // Radix expone los items tras el click
    const option = await screen.findByText('María González')
    fireEvent.click(option)

    // Debería consultar las notas del paciente seleccionado
    await waitFor(() => {
      expect(getClinicalNotesByPatient).toHaveBeenCalledWith('pat-1')
    })

    // Debería renderizar el Timeline de la sesión
    expect(screen.getByText('Línea de Tiempo de Sesiones')).toBeDefined()
    expect(screen.getByText('Sesión #1')).toBeDefined()
    expect(screen.getByText('Avance notable')).toBeDefined() // Al ser la primera, se expande por defecto
  })

  it('debería alternar (colapsar/expandir) los detalles de la sesión al hacer clic en ella', async () => {
    render(<HistorialClinicoPage />)

    await screen.findByText('Seleccione un paciente')
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByText('María González'))

    // Esperar a que cargue la sesión (que se abre por defecto)
    await screen.findByText('Motivo de Consulta')
    
    // Hacer clic en la cabecera de la sesión para colapsarla
    const sessionHeader = screen.getByText('Sesión #1')
    fireEvent.click(sessionHeader)

    // Los detalles extendidos deberían colapsarse y no estar presentes
    expect(screen.queryByText('Motivo de Consulta')).toBeNull()
  })

  it('debería mostrar estado vacío si el paciente no tiene notas registradas', async () => {
    vi.mocked(getClinicalNotesByPatient).mockResolvedValue({ success: true, data: [] })

    render(<HistorialClinicoPage />)

    await screen.findByText('Seleccione un paciente')
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByText('María González'))

    await waitFor(() => {
      expect(screen.getByText('Sin historial registrado')).toBeDefined()
      expect(screen.getByText('Este paciente aún no cuenta con sesiones clínicas registradas. Presione "Nueva Sesión" para comenzar.')).toBeDefined()
    })
  })
})
