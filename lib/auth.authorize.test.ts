import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocking dependencies of authorizeUser
vi.mock('./prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('./password', () => ({
  comparePassword: vi.fn(),
}))

import prisma from './prisma'
import { comparePassword } from './password'
import { authorizeUser } from './auth'

describe('authorizeUser Unit Test', () => {
  const credentials = {
    email: 'test@cipre.mx',
    password: 'password123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null if credentials are missing', async () => {
    const result = await authorizeUser(undefined)
    expect(result).toBeNull()
  })

  it('should return null if user is not found in database', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    
    const result = await authorizeUser(credentials)
    
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: credentials.email },
      include: { role: true }
    })
    expect(result).toBeNull()
  })

  it('should return null if password does not match', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@cipre.mx',
      password: 'hashedPassword',
      role: { name: 'Administrador' }
    } as any)
    vi.mocked(comparePassword).mockResolvedValue(false)

    const result = await authorizeUser(credentials)

    expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword')
    expect(result).toBeNull()
  })

  it('should return user object if credentials are valid', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      fullName: 'Juan Pérez',
      email: 'test@cipre.mx',
      password: 'hashedPassword',
      role: { name: 'Administrador' }
    } as any)
    vi.mocked(comparePassword).mockResolvedValue(true)

    const result = await authorizeUser(credentials)

    expect(result).toEqual({
      id: '1',
      name: 'Juan Pérez',
      email: 'test@cipre.mx',
      role: 'Administrador'
    })
  })
})
