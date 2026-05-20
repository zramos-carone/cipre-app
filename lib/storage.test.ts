import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { uploadFile } from "./storage"
import { put } from "@vercel/blob"
import * as fs from "fs"

// Mock de @vercel/blob
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}))

// Mock de fs
vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>()
  const mockWriteFileSync = vi.fn()
  const mockMkdirSync = vi.fn()
  const mockExistsSync = vi.fn(() => true)
  return {
    ...actual,
    writeFileSync: mockWriteFileSync,
    mkdirSync: mockMkdirSync,
    existsSync: mockExistsSync,
    default: {
      ...actual,
      writeFileSync: mockWriteFileSync,
      mkdirSync: mockMkdirSync,
      existsSync: mockExistsSync,
    }
  }
})

describe("Storage Utilities - uploadFile", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("debería subir al almacenamiento cloud (Vercel Blob) si hay token y es exitoso", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test_token"
    const mockUrl = "https://example.com/blob/test.pdf"
    
    vi.mocked(put).mockResolvedValue({ url: mockUrl } as any)

    const result = await uploadFile("test.pdf", "file_content")

    expect(put).toHaveBeenCalledWith("test.pdf", "file_content", {
      contentType: "application/pdf",
      access: "public",
      token: "test_token",
    })
    expect(result).toBe(mockUrl)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  it("debería hacer fallback a almacenamiento local si no hay token ni es producción", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    process.env.NODE_ENV = "development"
    
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = await uploadFile("test.pdf", "file_content")

    expect(put).not.toHaveBeenCalled()
    expect(fs.mkdirSync).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
    expect(result).toBe("/uploads/test.pdf")
  })

  it("debería hacer fallback a almacenamiento local si la subida cloud falla", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test_token"
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    vi.mocked(put).mockRejectedValue(new Error("Upload failed"))
    vi.mocked(fs.existsSync).mockReturnValue(true)

    const result = await uploadFile("test.pdf", "file_content")

    expect(put).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
    expect(result).toBe("/uploads/test.pdf")
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})
