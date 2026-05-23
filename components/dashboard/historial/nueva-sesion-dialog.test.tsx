import { render, screen, fireEvent } from '@testing-library/react'
import { NuevaSesionDialog } from './nueva-sesion-dialog'
import { describe, it, expect, vi } from 'vitest'

// Mock de ScrollArea/ResizeObserver que Radix UI y sus diálogos pueden requerir
global.ResizeObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

describe('NuevaSesionDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    patientId: 'patient-123',
    patientName: 'María González',
    onSubmit: vi.fn(),
    isSubmitting: false,
  }

  it('debería renderizar todos los campos requeridos del formulario', () => {
    render(<NuevaSesionDialog {...defaultProps} />)

    expect(screen.getByText('Nueva Sesión Clínica')).toBeDefined()
    expect(screen.getByText('María González')).toBeDefined()
    expect(screen.getByText('Fecha de la Sesión')).toBeDefined()
    expect(screen.getByText('Hora de la Sesión')).toBeDefined()
    expect(screen.getByText('Duración (minutos)')).toBeDefined()
    expect(screen.getByText('Estado Emocional Observado')).toBeDefined()
    expect(screen.getByText('Motivo de Consulta')).toBeDefined()
    expect(screen.getByText('Observaciones y Técnicas Aplicadas')).toBeDefined()
    expect(screen.getByText('Plan de Acción (Tareas)')).toBeDefined()
    expect(screen.getByText('Próxima Sesión Sugerida')).toBeDefined()
    expect(screen.getByRole('button', { name: /Guardar Sesión/i })).toBeDefined()
  })

  it('debería mostrar errores de validación si los campos obligatorios están incompletos', async () => {
    render(<NuevaSesionDialog {...defaultProps} />)

    // Hacer clic en Guardar sin rellenar campos requeridos
    fireEvent.click(screen.getByRole('button', { name: /Guardar Sesión/i }))

    // Deberían mostrarse mensajes de validación
    expect(await screen.findByText('El motivo de la consulta debe tener al menos 2 caracteres')).toBeDefined()
    expect(await screen.findByText('Las observaciones de la sesión deben tener al menos 2 caracteres')).toBeDefined()
    expect(await screen.findByText('El estado emocional observado es requerido')).toBeDefined()
    expect(await screen.findByText('El plan de acción debe tener al menos 2 caracteres')).toBeDefined()
  })

  it('debería mostrar el estado de guardado/cargando al enviar', () => {
    render(<NuevaSesionDialog {...defaultProps} isSubmitting={true} />)

    expect(screen.getByText('Guardando...')).toBeDefined()
    expect(screen.getByRole('button', { name: /Guardando.../i })).toBeDisabled()
  })

  it('no debería renderizar el modal cuando open es false', () => {
    const { container } = render(<NuevaSesionDialog {...defaultProps} open={false} />)

    expect(container.innerHTML).toBe('')
  })
})
