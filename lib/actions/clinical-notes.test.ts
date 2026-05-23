import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { createClinicalNote, getClinicalNotesByPatient, getLinkedPatients } from "./clinical-notes"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"

// Mock de NextAuth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

// Mock de Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    appointment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    clinicalNote: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    patient: {
      findMany: vi.fn(),
    },
  },
}))

// Mock de next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Clinical Notes Server Actions - createClinicalNote", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería rechazar si el usuario no ha iniciado sesión", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const formData = new FormData()
    const result = await createClinicalNote(formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain("No autorizado")
    expect(prisma.clinicalNote.create).not.toHaveBeenCalled()
  })

  it("debería rechazar si el usuario tiene el rol de Recepción", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", name: "Recep", role: "Recepción" }
    } as any)

    const formData = new FormData()
    const result = await createClinicalNote(formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Acceso denegado")
    expect(prisma.clinicalNote.create).not.toHaveBeenCalled()
  })

  it("debería rechazar si la validación de Zod falla", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "psy-1", name: "Psy", role: "Psicología" }
    } as any)

    const formData = new FormData() // datos vacíos
    const result = await createClinicalNote(formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Debe seleccionar un paciente")
    expect(prisma.clinicalNote.create).not.toHaveBeenCalled()
  })

  it("debería rechazar si un Psicólogo intenta registrar una nota para un paciente no vinculado", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "psy-1", name: "Dr. Fernando", role: "Psicología" }
    } as any)

    const formData = new FormData()
    formData.append("patientId", "patient-1")
    formData.append("sessionDate", "2026-05-23")
    formData.append("sessionTime", "15:00")
    formData.append("duration", "50")
    formData.append("reason", "Motivo de consulta")
    formData.append("observations", "Observaciones del caso")
    formData.append("emotionalState", "Tranquilo")
    formData.append("actionPlan", "Tareas asignadas")

    // Mockear que no existe cita (no vinculado)
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null)

    const result = await createClinicalNote(formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Únicamente puede registrar notas para pacientes vinculados")
    expect(prisma.appointment.findFirst).toHaveBeenCalled()
    expect(prisma.clinicalNote.create).not.toHaveBeenCalled()
  })

  it("debería permitir registrar nota si el Psicólogo está vinculado al paciente", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "psy-1", name: "Dr. Fernando", role: "Psicología" }
    } as any)

    const formData = new FormData()
    formData.append("patientId", "patient-1")
    formData.append("sessionDate", "2026-05-23")
    formData.append("sessionTime", "15:00")
    formData.append("duration", "50")
    formData.append("reason", "Motivo de consulta")
    formData.append("observations", "Observaciones del caso")
    formData.append("emotionalState", "Tranquilo")
    formData.append("actionPlan", "Tareas asignadas")

    // Mockear cita vinculada
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue({ id: "app-1" } as any)
    vi.mocked(prisma.clinicalNote.create).mockResolvedValue({ id: "note-1" } as any)

    const result = await createClinicalNote(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(prisma.appointment.findFirst).toHaveBeenCalled()
    expect(prisma.clinicalNote.create).toHaveBeenCalled()
  })

  it("debería permitir registrar nota si es un usuario de Administración (incluso sin cita)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "admin-1", name: "Admin", role: "Administración" }
    } as any)

    const formData = new FormData()
    formData.append("patientId", "patient-1")
    formData.append("sessionDate", "2026-05-23")
    formData.append("sessionTime", "15:00")
    formData.append("duration", "50")
    formData.append("reason", "Motivo de consulta")
    formData.append("observations", "Observaciones del caso")
    formData.append("emotionalState", "Tranquilo")
    formData.append("actionPlan", "Tareas asignadas")

    vi.mocked(prisma.clinicalNote.create).mockResolvedValue({ id: "note-2" } as any)

    const result = await createClinicalNote(formData)

    expect(result.success).toBe(true)
    expect(prisma.appointment.findFirst).not.toHaveBeenCalled() // No debe verificar vinculación para administradores
    expect(prisma.clinicalNote.create).toHaveBeenCalled()
  })
})

describe("Clinical Notes Server Actions - getClinicalNotesByPatient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería rechazar si el rol es Recepción", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", role: "Recepción" }
    } as any)

    const result = await getClinicalNotesByPatient("patient-1")

    expect(result.success).toBe(false)
    expect(result.error).toContain("Acceso denegado")
    expect(prisma.clinicalNote.findMany).not.toHaveBeenCalled()
  })

  it("debería permitir consultar si el Psicólogo está vinculado", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "psy-1", role: "Psicología" }
    } as any)

    vi.mocked(prisma.appointment.findFirst).mockResolvedValue({ id: "app-1" } as any)
    vi.mocked(prisma.clinicalNote.findMany).mockResolvedValue([{ id: "note-1" }] as any)

    const result = await getClinicalNotesByPatient("patient-1")

    expect(result.success).toBe(true)
    expect(result.data).toEqual([{ id: "note-1" }])
    expect(prisma.appointment.findFirst).toHaveBeenCalled()
    expect(prisma.clinicalNote.findMany).toHaveBeenCalled()
  })

  it("debería bloquear consulta si el Psicólogo no está vinculado", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "psy-1", role: "Psicología" }
    } as any)

    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null)

    const result = await getClinicalNotesByPatient("patient-1")

    expect(result.success).toBe(false)
    expect(result.error).toContain("Acceso denegado")
    expect(prisma.clinicalNote.findMany).not.toHaveBeenCalled()
  })

  it("debería permitir consultar a un Administrador", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "admin-1", role: "Administración" }
    } as any)

    vi.mocked(prisma.clinicalNote.findMany).mockResolvedValue([{ id: "note-1" }] as any)

    const result = await getClinicalNotesByPatient("patient-1")

    expect(result.success).toBe(true)
    expect(prisma.appointment.findFirst).not.toHaveBeenCalled()
    expect(prisma.clinicalNote.findMany).toHaveBeenCalled()
  })
})

describe("Clinical Notes Server Actions - getLinkedPatients", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería devolver todos los pacientes activos si es Administrador", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "admin-1", role: "Administración" }
    } as any)

    const mockPatients = [{ id: "p1", name: "María" }, { id: "p2", name: "Juan" }]
    vi.mocked(prisma.patient.findMany).mockResolvedValue(mockPatients as any)

    const result = await getLinkedPatients()

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockPatients)
    expect(prisma.patient.findMany).toHaveBeenCalled()
    expect(prisma.appointment.findMany).not.toHaveBeenCalled()
  })

  it("debería devolver sólo pacientes vinculados a citas si es Psicólogo", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "psy-1", role: "Psicología" }
    } as any)

    const mockAppointments = [
      { patient: { id: "p1", name: "María" } },
      { patient: { id: "p2", name: "Juan" } }
    ]
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockAppointments as any)

    const result = await getLinkedPatients()

    expect(result.success).toBe(true)
    expect(result.data).toEqual([{ id: "p2", name: "Juan" }, { id: "p1", name: "María" }]) // ordenado por nombre
    expect(prisma.appointment.findMany).toHaveBeenCalled()
  })
})
