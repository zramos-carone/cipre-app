import { describe, it, expect } from 'vitest'

// Simulamos la lógica del middleware para poder probarla unitariamente
function checkAccess(path: string, role: string | undefined): boolean {
  const roleBasedRoutes = [
    { path: "/dashboard/historial", restrictedFor: ["Recepción"] },
    { path: "/dashboard/usuarios", restrictedFor: ["Recepción", "Psicólogo"] },
  ]

  const currentRoute = roleBasedRoutes.find(route => path.startsWith(route.path))

  if (currentRoute) {
    if (currentRoute.restrictedFor.includes(role as string)) {
      return false // Acceso denegado
    }
  }

  return true // Acceso permitido
}

describe('Middleware Role Access Logic', () => {
  it('should deny access to /dashboard/historial for Recepción', () => {
    expect(checkAccess("/dashboard/historial", "Recepción")).toBe(false)
  })

  it('should allow access to /dashboard/historial for Administración', () => {
    expect(checkAccess("/dashboard/historial", "Administración")).toBe(true)
  })

  it('should deny access to /dashboard/usuarios for Psicólogo', () => {
    expect(checkAccess("/dashboard/usuarios", "Psicólogo")).toBe(false)
  })

  it('should allow access to /dashboard/usuarios for Administración', () => {
    expect(checkAccess("/dashboard/usuarios", "Administración")).toBe(true)
  })

  it('should allow access to generic dashboard routes for any role', () => {
    expect(checkAccess("/dashboard/perfil", "Recepción")).toBe(true)
    expect(checkAccess("/dashboard/agenda", "Psicólogo")).toBe(true)
  })
})
