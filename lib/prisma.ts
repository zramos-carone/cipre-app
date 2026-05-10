import { PrismaClient } from './generated/prisma'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  // Si usamos el protocolo prisma+postgres:// (Prisma Postgres), 
  // en Prisma 7 se debe pasar como accelerateUrl si no se usa adapter.
  if (connectionString.startsWith('prisma+postgres://')) {
    return new PrismaClient({
      accelerateUrl: connectionString
    })
  }

  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
