import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo Institucional", type: "email", placeholder: "usuario@cipre.mx" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // MOCK DE USUARIOS PARA CIPRE
        const users = [
          { id: "1", name: "Admin CIPRE", email: "admin@cipre.mx", password: "password", role: "Administración" },
          { id: "2", name: "Dra. Psicóloga", email: "psicologa@cipre.mx", password: "password", role: "Psicólogo" },
          { id: "3", name: "Recepción", email: "recepcion@cipre.mx", password: "password", role: "Recepción" },
        ];

        const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
        
        if (user) {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Inyectar el rol en el token JWT
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // Exponer el rol en el objeto de la sesión en el cliente
        (session.user as any).role = token.role;
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
