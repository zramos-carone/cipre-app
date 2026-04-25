"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/consentimientos", label: "Consentimientos", icon: FileText },
  { href: "/dashboard/historial", label: "Historial Clínico", icon: ClipboardList },
  { href: "/dashboard/devoluciones", label: "Devoluciones", icon: RotateCcw },
  { href: "/dashboard/pagos", label: "Pagos", icon: DollarSign },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <span className="text-lg font-bold text-primary-foreground">C</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">CIPRE</h1>
          <p className="text-xs text-muted-foreground">Sistema CRM</p>
        </div>
      </div>

      {/* Profile */}
      <div className="px-6 py-2">
        <p className="text-xs text-muted-foreground">Perfil actual</p>
        <p className="text-sm font-semibold text-sidebar-foreground">Administración</p>
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
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
