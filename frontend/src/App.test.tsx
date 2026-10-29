// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const bitcoin = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  imageUrl: 'https://example.com/bitcoin.png',
  price: 67_000,
  priceChangePercentage24h: 2.5,
  marketCap: 1_300_000_000_000,
  high24h: 69_000,
  low24h: 64_000,
  totalVolume24h: 45_000_000_000,
}

const ethereum = {
  ...bitcoin,
  id: 'ethereum',
  name: 'Ethereum',
  symbol: 'ETH',
}

type DetailResponse = Omit<typeof bitcoin, 'low24h' | 'marketCap'> & {
  low24h: number | null
  marketCap: number | null
  priceHistory: { timestamp: number; price: number }[] | null
}

let detailResponse: DetailResponse
let fetchMock: ReturnType<typeof vi.fn>
let detailRequestCount: number
let failedDetailRequests: Set<number>

beforeEach(() => {
  window.localStorage.clear()
  detailRequestCount = 0
  failedDetailRequests = new Set()
  detailResponse = {
    ...bitcoin,
    price: 67_250,
    priceChangePercentage24h: 2.75,
    high24h: 69_500,
    low24h: null,
    marketCap: null,
    totalVolume24h: 48_000_000_000,
    priceHistory: [
      { timestamp: 1_767_000_000_000, price: 64_000 },
      { timestamp: 1_767_086_400_000, price: 67_250 },
    ],
  }
  fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), window.location.origin)
    if (url.pathname === '/api/markets') {
      return { ok: true, json: async () => ({ data: [bitcoin, ethereum] }) } as Response
    }

    detailRequestCount += 1
    if (failedDetailRequests.has(detailRequestCount)) {
      return { ok: false, status: 500, json: async () => ({}) } as Response
    }
    return { ok: true, json: async () => detailResponse } as Response
  })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('market detail navigation', () => {
  it('opens the selected asset and shows available metrics and price history', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Bitcoin' }))

    expect(await screen.findByRole('region', { name: 'Detalle de Bitcoin' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeTruthy()
    expect(screen.getByText('$67,250.00')).toBeTruthy()
    expect(screen.getByText('Máximo 24h')).toBeTruthy()
    expect(screen.queryByText('Mínimo 24h')).toBeNull()
    expect(screen.queryByText('Capitalización')).toBeNull()
    expect(screen.getByText('Volumen 24h')).toBeTruthy()
    expect(
      await screen.findByRole('img', {
        name: 'Gráfico del precio en USD durante los últimos 7 días',
      }),
    ).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/markets/bitcoin?currency=USD',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('toggles a favorite without opening its detail', async () => {
    render(<App />)
    const favoriteButton = await screen.findByRole('button', {
      name: 'Añadir a favoritos: Bitcoin',
    })
    fireEvent.click(favoriteButton)

    expect(screen.getByRole('button', { name: 'Quitar de favoritos: Bitcoin' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Mercado de criptomonedas' })).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('persists detail favorites and reflects changes in the list', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Bitcoin' }))
    await screen.findByRole('img', {
      name: 'Gráfico del precio en USD durante los últimos 7 días',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Añadir a favoritos: Bitcoin' }))
    expect(window.localStorage.getItem('coin-watcher:favorites')).toBe(
      JSON.stringify([JSON.stringify(['BTC', 'Bitcoin'])]),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la lista' }))
    expect(
      await screen.findByRole('button', { name: 'Quitar de favoritos: Bitcoin' }),
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle de Bitcoin' }))
    await screen.findByRole('img', {
      name: 'Gráfico del precio en USD durante los últimos 7 días',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Quitar de favoritos: Bitcoin' }))
    expect(window.localStorage.getItem('coin-watcher:favorites')).toBe('[]')
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la lista' }))
    expect(
      await screen.findByRole('button', { name: 'Añadir a favoritos: Bitcoin' }),
    ).toBeTruthy()
  })

  it('refreshes detail every 10 seconds and stops refreshing after leaving', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Bitcoin' }))
    await screen.findByRole('img', {
      name: 'Gráfico del precio en USD durante los últimos 7 días',
    })
    expect(detailRequestCount).toBe(1)

    detailResponse.price = 68_000
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })
    expect(detailRequestCount).toBe(2)
    expect(screen.getByText('$68,000.00')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Volver a la lista' }))
    expect(screen.getByRole('region', { name: 'Mercado de criptomonedas' })).toBeTruthy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })
    expect(detailRequestCount).toBe(2)
  })

  it('offers retry after an initial detail error', async () => {
    failedDetailRequests.add(1)
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Bitcoin' }))

    expect(await screen.findByText('No se pudo cargar el detalle de esta moneda.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(
      await screen.findByRole('img', {
        name: 'Gráfico del precio en USD durante los últimos 7 días',
      }),
    ).toBeTruthy()
    expect(screen.queryByText('No se pudo cargar el detalle de esta moneda.')).toBeNull()
  })

  it('keeps the last detail data and reports a failed refresh', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    failedDetailRequests.add(2)
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Bitcoin' }))
    await screen.findByRole('img', {
      name: 'Gráfico del precio en USD durante los últimos 7 días',
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })

    expect(screen.getByText('$67,250.00')).toBeTruthy()
    expect(screen.getByRole('img', {
      name: 'Gráfico del precio en USD durante los últimos 7 días',
    })).toBeTruthy()
    expect(
      screen.getByText(
        'No se pudieron actualizar los datos de esta moneda. Se muestran los últimos datos recibidos.',
      ),
    ).toBeTruthy()
  })

  it('shows the unavailable message when no historical data is returned', async () => {
    detailResponse.priceHistory = null
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Ethereum' }))

    expect(await screen.findByText('No disponible')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Detalle de Ethereum' })).toBeTruthy()
  })

  it('returns to the list and scrolls to the top', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Bitcoin' }))
    await screen.findByRole('region', { name: 'Detalle de Bitcoin' })

    fireEvent.click(screen.getByRole('button', { name: 'Volver a la lista' }))

    expect(screen.getByRole('region', { name: 'Mercado de criptomonedas' })).toBeTruthy()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Detalle de Bitcoin' })).toBeNull()
    })
  })
})
