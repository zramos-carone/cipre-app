"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

interface RoleGateProps {
  children: ReactNode
  allowedRoles: string[]
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { data: session } = useSession()

  // Extraemos el rol desde la sesión (inyectado previamente en el token JWT)
  const userRole = (session?.user as any)?.role

  if (!userRole) {
    return null
  }

  if (!allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}
