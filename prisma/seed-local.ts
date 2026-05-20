import prisma from '../lib/prisma'

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

  await prisma.role.upsert({
    where: { name: 'Psicología' },
    update: {},
    create: {
      name: 'Psicología',
      description: 'Gestión de pacientes y notas clínicas',
    },
  })

  await prisma.role.upsert({
    where: { name: 'Recepción' },
    update: {},
    create: {
      name: 'Recepción',
      description: 'Gestión de citas y pagos',
    },
  })

  console.log('✅ Roles creados.')

  // 2. Crear Usuario Admin Base
  // Nota: La contraseña 'Psipre1!' es solo para desarrollo local
  await prisma.user.upsert({
    where: { email: 'admin@psipre.mx' },
    update: {},
    create: {
      email: 'admin@psipre.mx',
      fullName: 'Administrador PSIPRE',
      password: 'Psipre1!', // En producción se usa bcrypt
      roleId: adminRole.id,
    },
  })

  console.log('✅ Usuario Administrador (admin@psipre.mx) creado.')
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
