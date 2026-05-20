import prisma from '../lib/prisma'
import { hashPassword } from '../lib/password'

async function main() {
  console.log('🌱 Iniciando seeding de base de datos local...')

  // 1. Crear Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administración' },
    update: {},
    create: {
      name: 'Administración',
      description: 'Acceso total al sistema',
    },
  })

  const psychologyRole = await prisma.role.upsert({
    where: { name: 'Psicología' },
    update: {},
    create: {
      name: 'Psicología',
      description: 'Gestión de pacientes y notas clínicas',
    },
  })

  const receptionRole = await prisma.role.upsert({
    where: { name: 'Recepción' },
    update: {},
    create: {
      name: 'Recepción',
      description: 'Gestión de citas y pagos',
    },
  })

  console.log('✅ Roles creados.')

  // 2. Crear Usuario Admin Base
  const hashedPassword = await hashPassword('Psipre1!')
  await prisma.user.upsert({
    where: { email: 'admin@psipre.mx' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@psipre.mx',
      fullName: 'Administrador PSIPRE',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  })

  console.log('✅ Usuario Administrador (admin@psipre.mx) creado.')

  // 3. Crear Psicólogos Base
  const psyPassword = await hashPassword('Psipre1!')
  await prisma.user.upsert({
    where: { email: 'fernando.gomez@psipre.mx' },
    update: {
      password: psyPassword,
    },
    create: {
      email: 'fernando.gomez@psipre.mx',
      fullName: 'Dr. Fernando Gómez',
      password: psyPassword,
      roleId: psychologyRole.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'laura.torres@psipre.mx' },
    update: {
      password: psyPassword,
    },
    create: {
      email: 'laura.torres@psipre.mx',
      fullName: 'Dra. Laura Torres',
      password: psyPassword,
      roleId: psychologyRole.id,
    },
  })

  console.log('✅ Psicólogos base (Dr. Fernando Gómez, Dra. Laura Torres) creados.')
  console.log('🚀 Seeding completado con éxito.')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
