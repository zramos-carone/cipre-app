import { describe, it, expect } from 'vitest'

import { hasAccess } from './middleware'

describe('Middleware Role Access Logic', () => {
  it('should deny access to /dashboard/historial for Recepción', () => {
    expect(hasAccess("/dashboard/historial", "Recepción")).toBe(false)
  })

  it('should allow access to /dashboard/historial for Administración', () => {
    expect(hasAccess("/dashboard/historial", "Administración")).toBe(true)
  })

  it('should deny access to /dashboard/usuarios for Psicólogo', () => {
    expect(hasAccess("/dashboard/usuarios", "Psicólogo")).toBe(false)
  })

  it('should allow access to /dashboard/usuarios for Administración', () => {
    expect(hasAccess("/dashboard/usuarios", "Administración")).toBe(true)
  })

  it('should allow access to generic dashboard routes for any role', () => {
    expect(hasAccess("/dashboard/perfil", "Recepción")).toBe(true)
    expect(hasAccess("/dashboard/agenda", "Psicólogo")).toBe(true)
  })
})
