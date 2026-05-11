import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PatientForm } from './patient-form'
import { describe, it, expect, vi } from 'vitest'

describe('PatientForm', () => {
  it('debería mostrar errores de validación si el formulario se envía vacío', async () => {
    render(<PatientForm onSubmit={vi.fn()} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Registrar Paciente/i }))
    
    expect(await screen.findByText('El nombre completo debe tener al menos 3 caracteres')).toBeDefined()
  })

  it('debería llamar a onSubmit con los datos correctos', async () => {
    const onSubmit = vi.fn()
    render(<PatientForm onSubmit={onSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Juan Pérez' } })
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '1234567890' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Registrar Paciente/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '1234567890',
      })
    })
  })

  it('debería cargar datos iniciales para edición', () => {
    const initialData = {
      fullName: 'Juan Editado',
      email: 'editado@example.com',
      phone: '0987654321',
    }
    render(<PatientForm initialData={initialData} onSubmit={vi.fn()} />)
    
    expect(screen.getByDisplayValue('Juan Editado')).toBeDefined()
    expect(screen.getByDisplayValue('editado@example.com')).toBeDefined()
    expect(screen.getByDisplayValue('0987654321')).toBeDefined()
  })

  it('debería mostrar estado de carga', () => {
    render(<PatientForm onSubmit={vi.fn()} isSubmitting={true} />)
    expect(screen.getByText('Guardando...')).toBeDefined()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
