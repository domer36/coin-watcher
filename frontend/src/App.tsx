import { useEffect, useState } from 'react'
import './App.css'

interface MarketAsset {
  name: string
  symbol: string
  imageUrl: string
  price: number | null
  priceChangePercentage24h: number | null
}

interface MarketPage {
  data: MarketAsset[]
}

const API_PATH = '/api/markets'
const REFRESH_INTERVAL = 10_000

function App() {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    let inFlight = false
    let controller: AbortController | undefined

    async function loadMarkets() {
      if (inFlight) return

      inFlight = true
      setLoading(true)
      const requestController = new AbortController()
      controller = requestController

      try {
        const params = new URLSearchParams({
          currency: 'USD',
          page: '1',
          perPage: '20',
        })
        const response = await fetch(`${API_PATH}?${params}`, {
          signal: requestController.signal,
        })
        if (!response.ok) {
          throw new Error(`Market request failed (${response.status})`)
        }

        const result = (await response.json()) as MarketPage
        if (!active) return
        setAssets(result.data)
        setError('')
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudieron cargar los datos del mercado.',
          )
        }
      } finally {
        inFlight = false
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMarkets()
    const intervalId = window.setInterval(() => {
      void loadMarkets()
    }, REFRESH_INTERVAL)

    return () => {
      active = false
      window.clearInterval(intervalId)
      controller?.abort()
    }
  }, [retryCount])

  return (
    <main className="market-app">
      <header className="topbar">
        <h1>CryptoTracker Lite</h1>
      </header>

      <section className="market-list" aria-label="Mercado de criptomonedas">
        {loading && assets.length === 0 ? (
          <p className="list-state" role="status">
            <span className="spinner" aria-hidden="true" />
            Cargando datos del mercado…
          </p>
        ) : error && assets.length === 0 ? (
          <div className="list-state error-state" role="alert">
            <span className="error-mark" aria-hidden="true">!</span>
            <h2>Hubo un problema 😢</h2>
            <p>
              No se pudieron cargar los datos del mercado. Por favor, espera unos momentos y
              vuelve a intentarlo.
            </p>
            <button
              className="retry-button"
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Reintentar
            </button>
          </div>
        ) : assets.length === 0 ? (
          <p className="list-state">No hay datos de mercado disponibles.</p>
        ) : (
          <>
            <ul className="asset-list">
              {assets.map((asset) => (
                <li className="asset-row" key={`${asset.symbol}-${asset.name}`}>
                  <div className="asset-identity">
                    <span className="coin-icon" aria-hidden="true">
                      {asset.symbol.slice(0, 1)}
                      <img
                        src={asset.imageUrl}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.hidden = true
                        }}
                      />
                    </span>
                    <div className="asset-labels">
                      <span className="asset-name">{asset.name}</span>
                      <span className="asset-symbol">{asset.symbol}</span>
                    </div>
                  </div>
                  <div className="asset-market-data">
                    <span className="asset-price">{formatMoney(asset.price, 'USD')}</span>
                    <span
                      className={`asset-change ${changeClass(asset.priceChangePercentage24h)}`}
                    >
                      {formatPercentage(asset.priceChangePercentage24h)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {loading && (
              <p className="refresh-status" role="status">
                Actualizando datos…
              </p>
            )}
            {error && (
              <p className="inline-warning" role="status">
                No se pudieron actualizar los datos del mercado. Se muestran los últimos datos
                recibidos.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

function formatMoney(value: number | null, currency: string) {
  if (value === null) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 8,
    }).format(value)
  } catch {
    const amount = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 8,
    }).format(value)
    return `${amount} ${currency}`
  }
}

function formatPercentage(value: number | null) {
  if (value === null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function changeClass(value: number | null) {
  if (value === null || value === 0) return 'change-neutral'
  return value > 0 ? 'change-positive' : 'change-negative'
}

export default App
