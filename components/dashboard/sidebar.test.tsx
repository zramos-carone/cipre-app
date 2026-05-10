import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardSidebar } from './sidebar'
import { useSession, signOut } from 'next-auth/react'

// Mock de next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

describe('DashboardSidebar', () => {
  it('muestra el estado de carga cuando la sesión se está obteniendo', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
    } as any)

    render(<DashboardSidebar />)
    expect(screen.getByLabelText('Cargando perfil')).toBeDefined()
  })

  it('muestra el nombre y rol del usuario cuando está autenticado', () => {
    const mockSession = {
      user: {
        name: 'Juan Pérez',
        email: 'juan@cipre.mx',
        role: 'Administrador',
      },
    }
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    } as any)

    render(<DashboardSidebar />)
    expect(screen.getByText('Juan Pérez')).toBeDefined()
    expect(screen.getByText('Administrador')).toBeDefined()
  })

  it('llama a signOut al hacer clic en el botón de cerrar sesión', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Juan' } },
      status: 'authenticated',
    } as any)

    render(<DashboardSidebar />)
    const logoutButton = screen.getByText('Cerrar Sesión')
    fireEvent.click(logoutButton)

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
