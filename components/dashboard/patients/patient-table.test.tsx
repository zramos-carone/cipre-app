import { render, screen, fireEvent } from '@testing-library/react'
import { PatientTable } from './patient-table'
import { describe, it, expect, vi } from 'vitest'

const mockPatients = [
  {
    id: '1',
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '1234567890',
    createdAt: new Date('2024-01-01'),
  },
]

describe('PatientTable', () => {
  it('debería mostrar el mensaje de estado vacío cuando no hay pacientes', () => {
    render(<PatientTable patients={[]} />)
    expect(screen.getByText('No hay pacientes registrados')).toBeDefined()
  })

  it('debería renderizar la lista de pacientes correctamente', () => {
    render(<PatientTable patients={mockPatients} />)
    expect(screen.getByText('Juan Pérez')).toBeDefined()
    expect(screen.getByText('juan@example.com')).toBeDefined()
    expect(screen.getByText('1234567890')).toBeDefined()
  })

  it('debería llamar a onEdit cuando se hace clic en el botón de editar', () => {
    const onEdit = vi.fn()
    render(<PatientTable patients={mockPatients} onEdit={onEdit} />)
    
    // El primer botón de icono suele ser editar
    const editButton = screen.getAllByRole('button')[0]
    fireEvent.click(editButton)
    
    expect(onEdit).toHaveBeenCalledWith(mockPatients[0])
  })

  it('debería llamar a onDelete cuando se hace clic en el botón de eliminar', () => {
    const onDelete = vi.fn()
    render(<PatientTable patients={mockPatients} onDelete={onDelete} />)
    
    const deleteButton = screen.getAllByRole('button')[1]
    fireEvent.click(deleteButton)
    
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
