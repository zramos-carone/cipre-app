import { describe, it, expect } from 'vitest'
import { authOptions } from './auth'

describe('NextAuth Configuration Structural Validation', () => {
  it('should have PrismaAdapter configured', () => {
    expect(authOptions.adapter).toBeDefined()
  })

  it('should have CredentialsProvider configured', () => {
    const providers = authOptions.providers
    const credentialsProvider = providers.find(p => p.id === 'credentials')
    expect(credentialsProvider).toBeDefined()
  })

  it('should use JWT strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('should have custom login page configured', () => {
    expect(authOptions.pages?.signIn).toBe('/login')
  })

  it('should have role-handling callbacks defined', () => {
    expect(authOptions.callbacks?.jwt).toBeDefined()
    expect(authOptions.callbacks?.session).toBeDefined()
  })
})
