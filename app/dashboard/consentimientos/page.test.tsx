import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConsentimientosPage from './page'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Usar vi.hoisted para definir mocks que serán usados en vi.mock (hoisted al top)
const { mockGetPatients, mockGetInformedConsents } = vi.hoisted(() => ({
    mockGetPatients: vi.fn(),
    mockGetInformedConsents: vi.fn(),
}))

vi.mock('@/lib/actions/patients', () => ({ getPatients: mockGetPatients }))
vi.mock('@/lib/actions/consent', () => ({
    getInformedConsents: mockGetInformedConsents,
    toggleConsentSignature: vi.fn(),
    generateInformedConsent: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

global.ResizeObserver = class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

describe('ConsentimientosPage', () => {
    beforeEach(() => {
        mockGetPatients.mockReset()
        mockGetInformedConsents.mockReset()
        // Mocks por defecto que retornan promesas resueltas
        mockGetPatients.mockResolvedValue({ success: true, data: { patients: [] } })
        mockGetInformedConsents.mockResolvedValue({ success: true, data: [] })
    })

    const renderPage = async () => {
        const view = render(<ConsentimientosPage />)
        // Esperar a que las llamadas asíncronas iniciales terminen para evitar warnings de act(...)
        await waitFor(() => {
            expect(mockGetPatients).toHaveBeenCalled()
            expect(mockGetInformedConsents).toHaveBeenCalled()
        })
        return view
    }

    it('debería renderizar el título y la cabecera de la clínica', async () => {
        await renderPage()
        expect(screen.getByText('Clínica Preventiva CIPRE')).toBeDefined()
        expect(screen.getByText('Consentimientos Informados')).toBeDefined()
        expect(screen.getByText('Gestión de documentos de autorización, control de firmas y plantillas.')).toBeDefined()
    })

    it('debería renderizar los filtros de Paciente, Tipo y Estado', async () => {
        await renderPage()
        expect(screen.getByText('Paciente')).toBeDefined()
        expect(screen.getByText('Tipo de Consentimiento')).toBeDefined()
        expect(screen.getByText('Estado')).toBeDefined()
    })

    it('debería renderizar las tarjetas de consentimientos del mock data', async () => {
        await renderPage()
        expect(screen.getByText(/María González/)).toBeDefined()
        expect(screen.getByText(/Juan Pérez/)).toBeDefined()
        expect(screen.getByText(/Ana Martínez/)).toBeDefined()
        expect(screen.getByText(/Carlos López/)).toBeDefined()
    })

    it('debería abrir el diálogo al hacer clic en "Nuevo Consentimiento"', async () => {
        await renderPage()
        fireEvent.click(screen.getByRole('button', { name: /Nuevo Consentimiento/i }))
        expect(screen.getByText('Nuevo Consentimiento Informado')).toBeDefined()
    })

    it('debería mostrar botones de Ver y Descargar en las tarjetas', async () => {
        await renderPage()
        expect(screen.getAllByRole('button', { name: /ver/i }).length).toBeGreaterThanOrEqual(4)
        expect(screen.getAllByRole('button', { name: /descargar/i }).length).toBeGreaterThanOrEqual(4)
    })

    it('debería mostrar badges de estado "Firmado" y "Pendiente"', async () => {
        await renderPage()
        expect(screen.getAllByText('Firmado').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('Pendiente')).toBeDefined()
    })

    it('debería renderizar la sección de Plantillas Disponibles', async () => {
        await renderPage()
        expect(screen.getByText('Plantillas Disponibles')).toBeDefined()
        expect(screen.getAllByText('Tratamiento Psicológico').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Manejo de Datos Personales').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Evaluación Psicológica').length).toBeGreaterThanOrEqual(1)
    })

    it('debería mostrar la fecha formateada en el encabezado', async () => {
        await renderPage()
        expect(screen.getAllByText(/2026/).length).toBeGreaterThanOrEqual(1)
    })
})
