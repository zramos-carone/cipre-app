import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateConsentPdf } from "@/lib/pdf/consent-generator"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let patientName = ""
    let templateId: "tratamiento" | "datos" | "evaluacion" = "tratamiento"
    let date = new Date().toISOString().split("T")[0]
    let consentId = id

    // 1. Verificar si es un ID de consentimiento simulado (mock)
    const mockConsents: Record<
      string,
      { patientName: string; templateId: "tratamiento" | "datos" | "evaluacion"; date: string }
    > = {
      "1": { patientName: "María González", templateId: "tratamiento", date: "2026-03-15" },
      "2": { patientName: "Juan Pérez", templateId: "datos", date: "2026-04-01" },
      "3": { patientName: "Ana Martínez", templateId: "tratamiento", date: "2026-03-20" },
      "4": { patientName: "Carlos López", templateId: "evaluacion", date: "2026-04-02" },
    }

    if (id in mockConsents) {
      const mock = mockConsents[id]
      patientName = mock.patientName
      templateId = mock.templateId
      date = mock.date
    } else {
      // 2. Buscar el consentimiento informado en la base de datos
      const consent = await prisma.informedConsent.findUnique({
        where: { id },
        include: {
          patient: {
            select: {
              name: true,
              lastName: true,
            },
          },
        },
      })

      if (!consent) {
        return new NextResponse("Consentimiento no encontrado", { status: 404 })
      }

      patientName = `${consent.patient.name} ${consent.patient.lastName}`

      // 3. Extraer parámetros del query string o deducirlos del registro legado
      const { searchParams } = new URL(request.url)
      const qTemplate = searchParams.get("template")
      if (qTemplate === "tratamiento" || qTemplate === "datos" || qTemplate === "evaluacion") {
        templateId = qTemplate
      } else {
        // Deducir el tipo de plantilla a partir del documentUrl legado
        if (consent.documentUrl.includes("datos")) {
          templateId = "datos"
        } else if (consent.documentUrl.includes("evaluacion")) {
          templateId = "evaluacion"
        } else {
          templateId = "tratamiento"
        }
      }

      date =
        searchParams.get("date") ||
        (consent.signedAt
          ? new Date(consent.signedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0])
    }

    // 4. Generar el PDF dinámicamente en memoria
    const pdfBuffer = await generateConsentPdf({
      templateId,
      patientName,
      date,
      consentId,
    })

    // 5. Retornar el PDF directamente al navegador
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="consentimiento-${templateId}-${id}.pdf"`,
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    })
  } catch (error) {
    console.error("Error generating PDF on demand:", error)
    return new NextResponse("Error interno del servidor al generar el PDF", { status: 500 })
  }
}
