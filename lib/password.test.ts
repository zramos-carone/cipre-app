import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from './password'

describe('Password Utilities', () => {
  const password = 'mySecretPassword123'

  it('should hash a password correctly', async () => {
    const hash = await hashPassword(password)
    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(20)
  })

  it('should return true for a valid password match', async () => {
    const hash = await hashPassword(password)
    const isValid = await comparePassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should return false for an invalid password match', async () => {
    const hash = await hashPassword(password)
    const isValid = await comparePassword('wrongPassword', hash)
    expect(isValid).toBe(false)
  })
})
