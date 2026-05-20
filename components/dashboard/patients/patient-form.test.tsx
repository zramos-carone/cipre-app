import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PatientForm } from './patient-form'
import { describe, it, expect, vi } from 'vitest'

describe('PatientForm', () => {
  it('debería mostrar errores de validación si el formulario se envía vacío', async () => {
    render(<PatientForm onSubmit={vi.fn()} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Guardar Paciente/i }))
    
    expect(await screen.findByText('El nombre debe tener al menos 2 caracteres')).toBeDefined()
    expect(await screen.findByText('Los apellidos deben tener al menos 2 caracteres')).toBeDefined()
  })

  it('debería llamar a onSubmit con los datos correctos', async () => {
    const onSubmit = vi.fn()
    render(<PatientForm onSubmit={onSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/Nombre\(s\)/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '1234567890' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Guardar Paciente/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Juan',
        lastName: 'Pérez',
        birthDate: '',
        age: undefined,
        gender: '',
        address: '',
        phone: '1234567890',
        email: 'juan@example.com',
        emergencyContact: '',
      })
    })
  })

  it('debería cargar datos iniciales para edición', () => {
    const initialData = {
      name: 'Juan',
      lastName: 'Editado',
      birthDate: '1990-05-15',
      age: 36,
      gender: 'Masculino',
      address: 'Calle Falsa 123',
      phone: '0987654321',
      email: 'editado@example.com',
      emergencyContact: 'María Pérez - 9876543210'
    }
    render(<PatientForm initialData={initialData} onSubmit={vi.fn()} />)
    
    expect(screen.getByDisplayValue('Juan')).toBeDefined()
    expect(screen.getByDisplayValue('Editado')).toBeDefined()
    expect(screen.getByDisplayValue('1990-05-15')).toBeDefined()
    expect(screen.getByDisplayValue('36')).toBeDefined()
    expect(screen.getByDisplayValue('Masculino')).toBeDefined()
    expect(screen.getByDisplayValue('Calle Falsa 123')).toBeDefined()
    expect(screen.getByDisplayValue('0987654321')).toBeDefined()
    expect(screen.getByDisplayValue('editado@example.com')).toBeDefined()
    expect(screen.getByDisplayValue('María Pérez - 9876543210')).toBeDefined()
  })

  it('debería mostrar estado de carga', () => {
    render(<PatientForm onSubmit={vi.fn()} isSubmitting={true} />)
    expect(screen.getByText('Guardando...')).toBeDefined()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

