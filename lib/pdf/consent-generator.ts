import PDFDocument from "pdfkit"

export type ConsentTemplateId = "tratamiento" | "datos" | "evaluacion"

interface ConsentPdfOptions {
  templateId: ConsentTemplateId
  patientName: string   // nombre completo: name + lastName
  date: string          // YYYY-MM-DD
  consentId: string     // UUID del registro para el footer
}

// ─── Contenido de cada plantilla ────────────────────────────────────────────

const TEMPLATES: Record<
  ConsentTemplateId,
  { title: string; intro: string; sectionTitle: string; clauses: string[] }
> = {
  tratamiento: {
    title: "CONSENTIMIENTO INFORMADO PARA TRATAMIENTO PSICOLÓGICO",
    intro:
      "en pleno uso de mis facultades, declaro que he sido informado(a) de manera clara, completa y " +
      "suficiente sobre el tratamiento psicológico al que seré sometido(a).",
    sectionTitle: "ENTIENDO QUE:",
    clauses: [
      "El tratamiento psicológico implica sesiones regulares con un profesional de la salud mental colegiado y certificado.",
      "Durante las sesiones se abordarán aspectos relacionados con mi bienestar emocional, cognitivo y conductual.",
      "La duración y frecuencia del tratamiento serán determinadas por el profesional de acuerdo a mis necesidades específicas.",
      "Tengo derecho a interrumpir el tratamiento en cualquier momento sin necesidad de justificación.",
      "Toda la información compartida será confidencial, excepto en casos donde exista riesgo para mi integridad o la de terceros.",
    ],
  },
  datos: {
    title: "CONSENTIMIENTO INFORMADO PARA MANEJO DE DATOS PERSONALES",
    intro:
      "en pleno uso de mis facultades, otorgo mi consentimiento expreso, libre e informado para el " +
      "tratamiento y resguardo de mis datos personales por parte de Clínica Preventiva CIPRE.",
    sectionTitle: "SE ME HA INFORMADO QUE:",
    clauses: [
      "Mis datos serán recolectados, almacenados y utilizados única y exclusivamente con fines clínicos y administrativos.",
      "Se garantiza la confidencialidad absoluta de mi información personal y clínica de acuerdo con la legislación vigente.",
      "Puedo ejercer mis derechos de acceso, rectificación, cancelación y oposición en cualquier momento.",
      "Mis datos no serán compartidos con terceros sin mi autorización expresa y por escrito.",
      "Los datos serán conservados durante el tiempo legalmente establecido y posteriormente destruidos de forma segura.",
    ],
  },
  evaluacion: {
    title: "CONSENTIMIENTO INFORMADO PARA EVALUACIÓN PSICOLÓGICA",
    intro:
      "autorizo de manera voluntaria y consciente la realización de una evaluación psicológica " +
      "completa por parte de los profesionales de Clínica Preventiva CIPRE.",
    sectionTitle: "ENTIENDO QUE LA EVALUACIÓN INCLUYE:",
    clauses: [
      "Entrevista clínica inicial para conocer mi historia personal y los motivos de la consulta.",
      "Aplicación de pruebas psicométricas estandarizadas y validadas.",
      "Observación conductual durante las sesiones de evaluación.",
      "Análisis especializado e interpretación de los resultados obtenidos.",
      "Los resultados serán compartidos conmigo en una sesión de retroalimentación personalizada.",
      "Tengo derecho a solicitar una copia de mi informe de evaluación y a solicitar una segunda opinión.",
    ],
  },
}

// ─── Formato de fecha legible ────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ]
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`
}

// ─── Generador principal ─────────────────────────────────────────────────────

/**
 * Genera un PDF personalizado de consentimiento informado en memoria.
 * Retorna un Buffer listo para ser guardado con uploadFile().
 */
export function generateConsentPdf(options: ConsentPdfOptions): Promise<Buffer> {
  const { templateId, patientName, date, consentId } = options
  const template = TEMPLATES[templateId]
  const formattedDate = formatDate(date)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    // ── Encabezado clínica ───────────────────────────────────────────────────
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#2563eb")
    doc.text("CLÍNICA PREVENTIVA CIPRE", { align: "center" })
    doc.fontSize(11).font("Helvetica").fillColor("#64748b")
    doc.text("Psicología y Bienestar Mental", { align: "center" })

    doc.moveDown(0.5)
    doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#2563eb").lineWidth(1.5).stroke()
    doc.moveDown(1)

    // ── Título del documento ─────────────────────────────────────────────────
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e293b")
    doc.text(template.title, { align: "center" })
    doc.moveDown(0.4)
    doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#cbd5e1").lineWidth(0.8).stroke()
    doc.moveDown(1)

    // ── Datos del paciente ───────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e293b")
    doc.text("DATOS DEL PACIENTE", { align: "left" })
    doc.moveDown(0.4)

    // Tabla de datos
    const labelX = 60
    const valueX = 175
    const rowGap = 18

    const rows = [
      { label: "Nombre completo:", value: patientName },
      { label: "Fecha de emisión:", value: formattedDate },
      { label: "Nº Documento:", value: "____________________________" },
    ]

    rows.forEach(({ label, value }) => {
      const startY = doc.y
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#475569")
      doc.text(label, labelX, startY, { width: 110, continued: false })
      doc.fontSize(10).font("Helvetica").fillColor("#1e293b")
      doc.text(value, valueX, startY, { width: 340 })
      doc.y = startY + rowGap
    })

    doc.moveDown(0.8)
    doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#cbd5e1").lineWidth(0.8).stroke()
    doc.moveDown(1)

    // ── Declaración de consentimiento ────────────────────────────────────────
    doc.fontSize(11).font("Helvetica").fillColor("#334155")
    doc.text(
      `Yo, ${patientName}, ${template.intro}`,
      { align: "justify", lineGap: 3 }
    )
    doc.moveDown(1)

    // ── Sección de cláusulas ─────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e293b")
    doc.text(template.sectionTitle)
    doc.moveDown(0.5)

    template.clauses.forEach((clause, index) => {
      doc.fontSize(10.5).font("Helvetica").fillColor("#334155")
      doc.text(`${index + 1}. ${clause}`, {
        align: "justify",
        lineGap: 3,
        indent: 10,
      })
      doc.moveDown(0.4)
    })

    doc.moveDown(1)
    doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#cbd5e1").lineWidth(0.8).stroke()
    doc.moveDown(1.5)

    // ── Sección de firma ─────────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e293b")
    doc.text("FIRMA Y ACEPTACIÓN", { align: "left" })
    doc.moveDown(0.5)

    doc.fontSize(10).font("Helvetica").fillColor("#334155")
    doc.text(
      `Al firmar el presente documento, yo, ${patientName}, confirmo que he leído y comprendido ` +
      "completamente el contenido de este consentimiento informado, y acepto de manera libre, " +
      "voluntaria y sin presiones sus términos y condiciones.",
      { align: "justify", lineGap: 3 }
    )
    doc.moveDown(2)

    // Líneas de firma (dos columnas)
    const col1X = 60
    const col2X = 320
    const lineY = doc.y

    doc.moveTo(col1X, lineY).lineTo(col1X + 200, lineY).strokeColor("#1e293b").lineWidth(0.8).stroke()
    doc.moveTo(col2X, lineY).lineTo(col2X + 200, lineY).strokeColor("#1e293b").lineWidth(0.8).stroke()

    doc.moveDown(0.3)
    doc.fontSize(9).font("Helvetica").fillColor("#64748b")
    doc.text("Firma del Paciente", col1X, doc.y, { width: 200, align: "center" })
    doc.text("Firma del Profesional", col2X, doc.y - doc.currentLineHeight(), { width: 200, align: "center" })

    doc.moveDown(1.5)

    // Nombre y fecha bajo firma
    doc.fontSize(9).font("Helvetica").fillColor("#334155")
    doc.text(`Nombre: ${patientName}`, col1X)
    doc.text(`Fecha: ${formattedDate}`, col1X)

    // ── Pie de página ────────────────────────────────────────────────────────
    doc.moveDown(2)
    doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#cbd5e1").lineWidth(0.8).stroke()
    doc.moveDown(0.5)
    doc.fontSize(7.5).font("Helvetica").fillColor("#94a3b8")
    doc.text("Documento generado electrónicamente por Clínica Preventiva CIPRE · Psicología y Bienestar Mental", {
      align: "center",
    })
    doc.text(`ID de documento: ${consentId} · Generado el: ${formattedDate}`, {
      align: "center",
    })

    doc.end()
  })
}
