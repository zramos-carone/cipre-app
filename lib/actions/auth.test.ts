import { describe, it, expect } from 'vitest'
import { loginAction } from './auth'

describe('Auth Server Actions', () => {
  it('should return error for invalid email', async () => {
    const formData = new FormData()
    formData.append('email', 'not-an-email')
    formData.append('password', 'password123')

    const response = await loginAction(formData)
    expect(response.success).toBe(false)
    expect(response.error).toBe('Correo electrónico no válido')
  })

  it('should return error for empty password', async () => {
    const formData = new FormData()
    formData.append('email', 'test@cipre.mx')
    formData.append('password', '')

    const response = await loginAction(formData)
    expect(response.success).toBe(false)
    expect(response.error).toBe('La contraseña es obligatoria')
  })

  it('should return success for valid inputs', async () => {
    const formData = new FormData()
    formData.append('email', 'admin@cipre.mx')
    formData.append('password', 'password')

    const response = await loginAction(formData)
    expect(response.success).toBe(true)
    expect(response.data?.email).toBe('admin@cipre.mx')
  })
})
