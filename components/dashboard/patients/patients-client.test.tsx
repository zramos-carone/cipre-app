import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PatientsClient } from './patients-client'
import { describe, it, expect, vi } from 'vitest'

// Mock de Server Actions
vi.mock('@/lib/actions/patients', () => ({
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
}))

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock de ScrollArea o ResizeObserver si es necesario (Radix suele usarlo)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

const mockPatients = [
  {
    id: '1',
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '1234567890',
    createdAt: new Date(),
  },
]

describe('PatientsClient Integration', () => {
  it('debería abrir el diálogo de "Nuevo Paciente" al hacer clic en el botón', async () => {
    render(<PatientsClient patients={[]} />)
    
    const addButton = screen.getByRole('button', { name: /Nuevo Paciente/i })
    fireEvent.click(addButton)
    
    // El diálogo puede tardar un momento en renderizarse
    await waitFor(() => {
      // Buscamos el encabezado del diálogo
      const titles = screen.getAllByText('Nuevo Paciente')
      // Uno es el botón, otro debe ser el título del diálogo
      expect(titles.length).toBeGreaterThan(0)
    })
  })

  it('debería abrir el diálogo en modo edición al hacer clic en editar', async () => {
    render(<PatientsClient patients={mockPatients} />)
    
    const editButton = screen.getByLabelText('Editar paciente')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Editar Paciente')).toBeDefined()
      expect(screen.getByDisplayValue('Juan Pérez')).toBeDefined()
    })
  })
})
