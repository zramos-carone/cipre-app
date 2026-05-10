import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Lógica pura de verificación de acceso basada en roles.
 * Extraída para facilitar pruebas unitarias.
 */
export function hasAccess(path: string, role: string | undefined): boolean {
  const roleBasedRoutes = [
    { path: "/dashboard/historial", restrictedFor: ["Recepción"] },
    { path: "/dashboard/usuarios", restrictedFor: ["Recepción", "Psicólogo"] },
  ]

  const currentRoute = roleBasedRoutes.find(route => path.startsWith(route.path))

  if (currentRoute) {
    if (currentRoute.restrictedFor.includes(role as string)) {
      return false
    }
  }

  return true
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!hasAccess(path, token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    }
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}
