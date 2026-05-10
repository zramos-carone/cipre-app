import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Ejemplo de RBAC: Proteger la ruta historial para que Recepción no pueda entrar
    if (path.startsWith("/dashboard/historial")) {
      if (token?.role === "Recepción") {
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
