import { describe, it, expect } from 'vitest'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from './prisma'

describe('NextAuth Prisma Adapter Structural Validation', () => {
  it('should be able to instantiate the PrismaAdapter with our prisma client', () => {
    const adapter = PrismaAdapter(prisma)
    expect(adapter).toBeDefined()
    expect(adapter.createUser).toBeDefined()
    expect(adapter.getUser).toBeDefined()
  })
})
