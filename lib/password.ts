import bcrypt from 'bcryptjs'

/**
 * Cifra una contraseña usando un salt de 12 rondas.
 * @param password Contraseña en texto plano.
 * @returns Hash de la contraseña.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

/**
 * Compara una contraseña en texto plano con un hash.
 * @param password Contraseña en texto plano.
 * @param hash Hash guardado en la base de datos.
 * @returns Booleano indicando si coinciden.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
