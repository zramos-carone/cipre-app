"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  RotateCcw,
  DollarSign,
  LogOut,
  Clock,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/consentimientos", label: "Consentimientos", icon: FileText },
  { href: "/dashboard/historial", label: "Historial Clínico", icon: ClipboardList },
  { href: "/dashboard/devoluciones", label: "Devoluciones", icon: RotateCcw },
  { href: "/dashboard/pagos", label: "Pagos", icon: DollarSign },
  { href: "/dashboard/asistencia", label: "Control de Acceso", icon: Clock },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
          <span className="text-lg font-bold text-primary-foreground">C</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">CIPRE</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">Sistema CRM</p>
        </div>
      </div>

      {/* Profile */}
      <div className="mx-4 mb-4 rounded-xl bg-sidebar-accent/30 p-4 border border-sidebar-border/50">
        {isLoading ? (
          <div className="space-y-2 animate-pulse" aria-label="Cargando perfil">
            <div className="h-3 w-24 rounded bg-sidebar-foreground/10"></div>
            <div className="h-2 w-16 rounded bg-muted-foreground/10"></div>
          </div>
        ) : (
          <>
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {session?.user?.name || "Usuario"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-xs font-medium text-muted-foreground">
                {(session?.user as any)?.role || "Sin rol"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
