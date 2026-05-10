import { describe, it, expect } from 'vitest'
import prisma from './prisma'

describe('Prisma Client Structural Validation', () => {
  it('should have the User model defined', () => {
    expect(prisma.user).toBeDefined()
  })

  it('should have the Patient model defined', () => {
    expect(prisma.patient).toBeDefined()
  })

  it('should have the Role model defined', () => {
    expect(prisma.role).toBeDefined()
  })

  it('should have the Appointment model defined', () => {
    expect(prisma.appointment).toBeDefined()
  })
})
