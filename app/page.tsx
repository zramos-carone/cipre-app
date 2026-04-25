"use client"

import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    window.location.assign("/dashboard")
  }, [])

  return (
    <div className="flex bg-background h-screen w-screen items-center justify-center font-sans">
      <p className="text-muted-foreground animate-pulse">Cargando CIPRE...</p>
    </div>
  )
}
