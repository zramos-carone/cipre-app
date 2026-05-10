import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rutas que requieren permisos específicos (RBAC)
    const roleBasedRoutes = [
      { path: "/dashboard/historial", restrictedFor: ["Recepción"] },
      { path: "/dashboard/usuarios", restrictedFor: ["Recepción", "Psicólogo"] },
    ]

    const currentRoute = roleBasedRoutes.find(route => path.startsWith(route.path))

    if (currentRoute) {
      if (currentRoute.restrictedFor.includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
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
