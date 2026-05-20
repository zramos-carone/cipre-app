import { put } from "@vercel/blob"
import fs from "fs"
import { join } from "path"

/**
 * Sube un archivo a almacenamiento cloud (Vercel Blob) o localmente en desarrollo/test
 * si no se configuran las variables de entorno.
 */
export async function uploadFile(
  filename: string,
  content: Buffer | string,
  contentType: string = "application/pdf"
): Promise<string> {
  const isProd = process.env.NODE_ENV === "production"
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN

  if (isProd || hasToken) {
    try {
      const blob = await put(filename, content, {
        contentType,
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error)
      // Si falla, caemos en fallback local
    }
  }

  // Fallback Local (Desarrollo / Tests)
  try {
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const filePath = join(uploadDir, filename)
    fs.writeFileSync(filePath, content)
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error saving file locally:", error)
    throw new Error("No se pudo guardar el archivo")
  }
}
