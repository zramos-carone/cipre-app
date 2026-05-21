const fs = require("fs")
const PDFDocument = require("pdfkit")

const templates = [
   {
      id: "tratamiento",
      title: "CONSENTIMIENTO INFORMADO\nTRATAMIENTO PSICOLÓGICO",
      content: [
         { text: "CONSENTIMIENTO INFORMADO PARA TRATAMIENTO PSICOLÓGICO", size: 13, bold: true, underline: true },
         { text: "" },
         { text: "Fecha: _____________________", size: 11 },
         { text: "" },
         { text: "Yo, _____________________________, identificado(a) con documento de identidad No. _____________________, declaro que he sido informado(a) de manera clara, completa y suficiente sobre el tratamiento psicológico al que seré sometido(a).", size: 11 },
         { text: "" },
         { text: "ENTIENDO QUE:", size: 12, bold: true },
         { text: "1. El tratamiento psicológico implica sesiones regulares con un profesional de la salud mental colegiado y certificado.", size: 11 },
         { text: "2. Durante las sesiones se abordarán aspectos relacionados con mi bienestar emocional, cognitivo y conductual.", size: 11 },
         { text: "3. La duración y frecuencia del tratamiento serán determinadas por el profesional de acuerdo a mis necesidades específicas.", size: 11 },
         { text: "4. Tengo derecho a interrumpir el tratamiento en cualquier momento sin necesidad de justificación.", size: 11 },
         { text: "5. Toda la información compartida será confidencial, excepto en casos donde exista riesgo para mi integridad o la de terceros.", size: 11 },
         { text: "" },
         { text: "___________________________________________________________________", size: 10 },
         { text: "" },
         { text: "FIRMA DEL PACIENTE: _____________________", size: 11 },
         { text: "NOMBRE: _____________________", size: 11 },
         { text: "C.C.: _____________________", size: 11 },
      ]
   },
   {
      id: "datos",
      title: "CONSENTIMIENTO INFORMADO\nPROTECCIÓN DE DATOS",
      content: [
         { text: "CONSENTIMIENTO INFORMADO PARA MANEJO DE DATOS PERSONALES", size: 13, bold: true, underline: true },
         { text: "" },
         { text: "Fecha: _____________________", size: 11 },
         { text: "" },
         { text: "Yo, _____________________________, identificado(a) con documento de identidad No. _____________________, en pleno uso de mis facultades, otorgo mi consentimiento expreso, libre e informado para el tratamiento y resguardo de mis datos personales por parte de Clínica Preventiva PSIPRE.", size: 11 },
         { text: "" },
         { text: "SE ME HA INFORMADO QUE:", size: 12, bold: true },
         { text: "1. Mis datos serán recolectados, almacenados y utilizados única y exclusivamente con fines clínicos y administrativos.", size: 11 },
         { text: "2. Se garantiza la confidencialidad absoluta de mi información personal y clínica de acuerdo con la legislación vigente.", size: 11 },
         { text: "3. Puedo ejercer mis derechos de acceso, rectificación, cancelación y oposición en cualquier momento.", size: 11 },
         { text: "4. Mis datos no serán compartidos con terceros sin mi autorización expresa y por escrito.", size: 11 },
         { text: "5. Los datos serán conservados durante el tiempo legalmente establecido y posteriormente destruidos de forma segura.", size: 11 },
         { text: "" },
         { text: "___________________________________________________________________", size: 10 },
         { text: "" },
         { text: "FIRMA DEL PACIENTE: _____________________", size: 11 },
         { text: "NOMBRE: _____________________", size: 11 },
         { text: "C.C.: _____________________", size: 11 },
      ]
   },
   {
      id: "evaluacion",
      title: "CONSENTIMIENTO INFORMADO\nEVALUACIÓN PSICOLÓGICA",
      content: [
         { text: "CONSENTIMIENTO INFORMADO PARA EVALUACIÓN PSICOLÓGICA", size: 13, bold: true, underline: true },
         { text: "" },
         { text: "Fecha: _____________________", size: 11 },
         { text: "" },
         { text: "Yo, _____________________________, identificado(a) con documento de identidad No. _____________________, autorizo de manera voluntaria y consciente la realización de una evaluación psicológica completa.", size: 11 },
         { text: "" },
         { text: "ENTIENDO QUE LA EVALUACIÓN INCLUYE:", size: 12, bold: true },
         { text: "1. Entrevista clínica inicial para conocer mi historia personal y los motivos de la consulta.", size: 11 },
         { text: "2. Aplicación de pruebas psicométricas estandarizadas y validadas.", size: 11 },
         { text: "3. Observación conductual durante las sesiones de evaluación.", size: 11 },
         { text: "4. Análisis especializado e interpretación de los resultados obtenidos.", size: 11 },
         { text: "" },
         { text: "HE SIDO INFORMADO(A) QUE:", size: 12, bold: true },
         { text: "- Los resultados serán compartidos conmigo en una sesión de retroalimentación personalizada.", size: 11 },
         { text: "- Tengo derecho a solicitar una copia de mi informe de evaluación.", size: 11 },
         { text: "- Los resultados tienen carácter estrictamente confidencial.", size: 11 },
         { text: "- Puedo solicitar una segunda opinión si así lo deseo.", size: 11 },
         { text: "" },
         { text: "___________________________________________________________________", size: 10 },
         { text: "" },
         { text: "FIRMA DEL PACIENTE: _____________________", size: 11 },
         { text: "NOMBRE: _____________________", size: 11 },
         { text: "C.C.: _____________________", size: 11 },
      ]
   }
]

templates.forEach((t) => {
   const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 60, bottom: 60, left: 60, right: 60 }
   })

   const stream = fs.createWriteStream(`public/uploads/${t.id}.pdf`)
   doc.pipe(stream)

   // Header with clinic info
   doc.fontSize(16).font("Helvetica-Bold").fillColor("#2563eb")
   doc.text("CLÍNICA PREVENTIVA PSIPRE", { align: "center" })
   doc.fontSize(11).font("Helvetica").fillColor("#64748b")
   doc.text("Psicología y Bienestar", { align: "center" })

   // Separator line
   doc.moveDown(0.5)
   doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#2563eb").stroke()
   doc.moveDown(1)

   // Title
   doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e293b")
   doc.text(t.title.replace("\n", " - "), { align: "center" })
   doc.moveDown(1)

   // Divider
   doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#cbd5e1").stroke()
   doc.moveDown(1)

   // Content
   t.content.forEach((item) => {
      if (item.text === "") {
         doc.moveDown(0.5)
      } else if (item.underline) {
         doc.fontSize(item.size || 11).font(item.bold ? "Helvetica-Bold" : "Helvetica").fillColor("#1e293b")
         doc.text(item.text, { align: "center" })
         // underline manually
         const width = doc.widthOfString(item.text)
         const x = (612 - width) / 2
         doc.moveTo(x, doc.y - 3).lineTo(x + width, doc.y - 3).strokeColor("#1e293b").stroke()
         doc.moveDown(0.3)
      } else {
         doc.fontSize(item.size || 11).font(item.bold ? "Helvetica-Bold" : "Helvetica").fillColor(item.text.startsWith("FIRMA") || item.text.startsWith("C.C.") || item.text.startsWith("NOMBRE") ? "#1e293b" : "#334155")
         doc.text(item.text, {
            align: "left",
            lineGap: 4
         })
      }
   })

   // Footer
   doc.moveDown(2)
   doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor("#cbd5e1").stroke()
   doc.moveDown(0.5)
   doc.fontSize(8).font("Helvetica").fillColor("#94a3b8")
   doc.text("Documento generado electrónicamente por Clínica Preventiva PSIPRE", { align: "center" })
   doc.text(`ID: ${t.id.toUpperCase()}-${Date.now()}`, { align: "center" })

   doc.end()

   console.log(`✓ Generando: public/uploads/${t.id}.pdf`)
})

console.log("\n✅ Todos los PDFs generados exitosamente con diseño profesional.")