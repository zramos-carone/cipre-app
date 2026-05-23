import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { uploadInformedConsent, getInformedConsents, toggleConsentSignature, generateInformedConsent } from "./consent"
import prisma from "@/lib/prisma"
import { uploadFile } from "@/lib/storage"

// Mock de Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    patient: {
      findUnique: vi.fn(),
    },
    informedConsent: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock de next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock de storage
vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn(),
}))

// Mock del generador de PDFs personalizados
vi.mock("@/lib/pdf/consent-generator", () => ({
  generateConsentPdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
}))

describe("Consent Server Actions - uploadInformedConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería subir y enlazar un consentimiento exitosamente", async () => {
    const formData = new FormData()
    formData.append("patientId", "patient-123")
    
    // Crear un archivo mock válido
    const mockFile = new File(["dummy content"], "consent.pdf", { type: "application/pdf" })
    formData.append("file", mockFile)

    // Configurar mocks
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: "patient-123", name: "Juan", lastName: "Pérez" } as any)
    vi.mocked(uploadFile).mockResolvedValue("https://example.com/consent.pdf")
    
    const mockConsent = {
      id: "consent-999",
      patientId: "patient-123",
      documentUrl: "https://example.com/consent.pdf",
      isSigned: false,
      signedAt: null
    }
    vi.mocked(prisma.informedConsent.upsert).mockResolvedValue(mockConsent as any)

    const result = await uploadInformedConsent(formData)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockConsent)
    expect(prisma.patient.findUnique).toHaveBeenCalledWith({ where: { id: "patient-123" } })
    expect(uploadFile).toHaveBeenCalled()
    expect(prisma.informedConsent.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { patientId: "patient-123" },
      create: expect.objectContaining({
        patientId: "patient-123",
        documentUrl: "https://example.com/consent.pdf"
      })
    }))
  })

  it("debería fallar si falta el ID del paciente", async () => {
    const formData = new FormData()
    const mockFile = new File(["dummy content"], "consent.pdf", { type: "application/pdf" })
    formData.append("file", mockFile)

    const result = await uploadInformedConsent(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe("El ID del paciente es requerido")
    expect(prisma.patient.findUnique).not.toHaveBeenCalled()
  })

  it("debería fallar si falta el archivo", async () => {
    const formData = new FormData()
    formData.append("patientId", "patient-123")

    const result = await uploadInformedConsent(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Debe seleccionar un archivo PDF válido")
  })

  it("debería fallar si el paciente no existe en el sistema", async () => {
    const formData = new FormData()
    formData.append("patientId", "patient-nonexistent")
    const mockFile = new File(["dummy content"], "consent.pdf", { type: "application/pdf" })
    formData.append("file", mockFile)

    vi.mocked(prisma.patient.findUnique).mockResolvedValue(null)

    const result = await uploadInformedConsent(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe("El paciente especificado no existe en el sistema")
    expect(uploadFile).not.toHaveBeenCalled()
  })

  it("debería manejar errores de base de datos o subida", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const formData = new FormData()
    formData.append("patientId", "patient-123")
    const mockFile = new File(["dummy content"], "consent.pdf", { type: "application/pdf" })
    formData.append("file", mockFile)

    vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: "patient-123" } as any)
    vi.mocked(uploadFile).mockRejectedValue(new Error("Storage service unavailable"))

    const result = await uploadInformedConsent(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Error interno al subir el consentimiento informado")
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})

describe("Consent Server Actions - getInformedConsents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería recuperar todos los consentimientos de la base de datos", async () => {
    const mockConsents = [
      { id: "1", patientId: "p1", documentUrl: "url1", isSigned: true, patient: { name: "A", lastName: "B" } },
      { id: "2", patientId: "p2", documentUrl: "url2", isSigned: false, patient: { name: "C", lastName: "D" } }
    ]
    vi.mocked(prisma.informedConsent.findMany).mockResolvedValue(mockConsents as any)

    const result = await getInformedConsents()

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockConsents)
    expect(prisma.informedConsent.findMany).toHaveBeenCalled()
  })

  it("debería manejar errores al consultar la base de datos", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(prisma.informedConsent.findMany).mockRejectedValue(new Error("DB Connection timeout"))

    const result = await getInformedConsents()

    expect(result.success).toBe(false)
    expect(result.error).toBe("Error al obtener el listado de consentimientos")
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})

describe("Consent Server Actions - toggleConsentSignature", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería firmar un consentimiento exitosamente", async () => {
    const mockConsent = { id: "consent-123", isSigned: true, signedAt: new Date() }
    vi.mocked(prisma.informedConsent.update).mockResolvedValue(mockConsent as any)

    const result = await toggleConsentSignature("consent-123", true)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockConsent)
    expect(prisma.informedConsent.update).toHaveBeenCalledWith({
      where: { id: "consent-123" },
      data: {
        isSigned: true,
        signedAt: expect.any(Date)
      }
    })
  })

  it("debería quitar la firma de un consentimiento exitosamente", async () => {
    const mockConsent = { id: "consent-123", isSigned: false, signedAt: null }
    vi.mocked(prisma.informedConsent.update).mockResolvedValue(mockConsent as any)

    const result = await toggleConsentSignature("consent-123", false)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockConsent)
    expect(prisma.informedConsent.update).toHaveBeenCalledWith({
      where: { id: "consent-123" },
      data: {
        isSigned: false,
        signedAt: null
      }
    })
  })

  it("debería fallar si falta el ID del consentimiento", async () => {
    const result = await toggleConsentSignature("", true)

    expect(result.success).toBe(false)
    expect(result.error).toBe("El ID del consentimiento es requerido")
    expect(prisma.informedConsent.update).not.toHaveBeenCalled()
  })

  it("debería manejar errores al actualizar en la base de datos", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(prisma.informedConsent.update).mockRejectedValue(new Error("Database write failed"))

    const result = await toggleConsentSignature("consent-123", true)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Error interno al actualizar el estado de firma")
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})

describe("Consent Server Actions - generateInformedConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("debería generar un consentimiento informado con enlace dinámico exitosamente", async () => {
    const data = {
      patientId: "patient-123",
      templateId: "tratamiento",
      date: "2026-05-20"
    }

    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: "patient-123",
      name: "Juan",
      lastName: "Pérez",
      informedConsent: null
    } as any)

    // Simular creación del registro
    vi.mocked(prisma.informedConsent.create).mockImplementation(async (args: any) => {
      return {
        id: args.data.id || "consent-mock-id",
        patientId: args.data.patientId,
        documentUrl: args.data.documentUrl,
        isSigned: args.data.isSigned,
        signedAt: null
      } as any
    })

    const result = await generateInformedConsent(data)

    expect(result.success).toBe(true)
    expect(result.data?.documentUrl).toMatch(/^\/api\/consentimientos\/[a-f0-9-]+\/pdf\?template=tratamiento&date=2026-05-20/)
    expect(prisma.patient.findUnique).toHaveBeenCalledWith({
      where: { id: "patient-123" },
      include: { informedConsent: true }
    })
    expect(prisma.informedConsent.create).toHaveBeenCalledWith({
      data: {
        id: expect.any(String),
        patientId: "patient-123",
        documentUrl: expect.stringMatching(/^\/api\/consentimientos\/[a-f0-9-]+\/pdf\?template=tratamiento&date=2026-05-20/),
        isSigned: false
      }
    })
    // No debe subir archivos ni actualizar el registro de nuevo
    expect(uploadFile).not.toHaveBeenCalled()
    expect(prisma.informedConsent.update).not.toHaveBeenCalled()
  })

  it("debería fallar si falla la validación del esquema de Zod (ej: templateId inválido)", async () => {
    const data = {
      patientId: "patient-123",
      templateId: "invalida" as any,
      date: "2026-05-20"
    }

    const result = await generateInformedConsent(data)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Por favor, seleccione una plantilla de consentimiento válida")
    expect(prisma.patient.findUnique).not.toHaveBeenCalled()
  })

  it("debería fallar si el paciente no existe en el sistema", async () => {
    const data = {
      patientId: "patient-nonexistent",
      templateId: "tratamiento",
      date: "2026-05-20"
    }

    vi.mocked(prisma.patient.findUnique).mockResolvedValue(null)

    const result = await generateInformedConsent(data)

    expect(result.success).toBe(false)
    expect(result.error).toBe("El paciente especificado no existe en el sistema")
    expect(prisma.informedConsent.create).not.toHaveBeenCalled()
  })

  it("debería fallar si el paciente ya cuenta con un consentimiento (1-1)", async () => {
    const data = {
      patientId: "patient-123",
      templateId: "tratamiento",
      date: "2026-05-20"
    }

    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: "patient-123",
      name: "Juan",
      lastName: "Pérez",
      informedConsent: { id: "consent-existing", documentUrl: "url" }
    } as any)

    const result = await generateInformedConsent(data)

    expect(result.success).toBe(false)
    expect(result.error).toBe("El paciente ya tiene un consentimiento informado registrado")
    expect(prisma.informedConsent.create).not.toHaveBeenCalled()
  })

  it("debería manejar errores de base de datos de manera segura", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const data = {
      patientId: "patient-123",
      templateId: "tratamiento",
      date: "2026-05-20"
    }

    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: "patient-123",
      name: "Juan",
      lastName: "Pérez",
      informedConsent: null
    } as any)

    vi.mocked(prisma.informedConsent.create).mockRejectedValue(new Error("Prisma client connection lost"))

    const result = await generateInformedConsent(data)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Error interno al generar el consentimiento informado")
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})

