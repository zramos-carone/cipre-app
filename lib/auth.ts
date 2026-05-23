import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma"
import { comparePassword } from "./password"

/**
 * Lógica pura de autorización para NextAuth.
 * Extraída para permitir pruebas unitarias sin dependencias complejas.
 */
export async function authorizeUser(credentials: Record<string, string> | undefined) {
  if (!credentials?.email || !credentials?.password) return null;

  // Buscar usuario en la BD real, incluyendo su rol
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: { role: true }
  });

  if (!user || !user.password) {
    return null;
  }

  // Comparar contraseña cifrada
  const isPasswordValid = await comparePassword(credentials.password, user.password);

  if (!isPasswordValid) {
    return null;
  }
  
  // Retornar objeto de usuario para la sesión
  return { 
    id: user.id, 
    name: user.fullName, 
    email: user.email, 
    role: user.role.name 
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo Institucional", type: "email", placeholder: "usuario@psipre.mx" },
        password: { label: "Contraseña", type: "Psipre1!" }
      },
      authorize: authorizeUser
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Inyectar el nombre del rol e id en el token JWT
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // Exponer el nombre del rol e id en el objeto de la sesión en el cliente
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Vista de login personalizada
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};
