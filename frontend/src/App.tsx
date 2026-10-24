import { useEffect, useRef, useState } from 'react'
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

type MarketError = 'initial' | 'rate-limit' | 'refresh' | null

class MarketRequestError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Market request failed (${status})`)
    this.name = 'MarketRequestError'
    this.status = status
  }
}

const API_PATH = '/api/markets'
const REFRESH_INTERVAL = 10_000
const FAVORITES_STORAGE_KEY = 'coin-watcher:favorites'
const PROFILE = {
  name: 'Bryan Vazquez',
  email: 'bryan@correo.com',
}

function App() {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [favoriteAssets, setFavoriteAssets] = useState(readFavoriteAssets)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marketError, setMarketError] = useState<MarketError>(null)
  const [retryCount, setRetryCount] = useState(0)
  const hasLoadedMarkets = useRef(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLElement>(null)
  const menuWasOpen = useRef(false)

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
          throw new MarketRequestError(response.status)
        }

        const result = (await response.json()) as MarketPage
        if (!active) return
        setAssets(result.data)
        hasLoadedMarkets.current = true
        setMarketError(null)
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        if (active) {
          setMarketError(
            hasLoadedMarkets.current
              ? requestError instanceof MarketRequestError && requestError.status === 429
                ? 'rate-limit'
                : 'refresh'
              : 'initial',
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

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteAssets))
    } catch (storageError) {
      console.error('No se pudieron guardar las monedas favoritas.', storageError)
    }
  }, [favoriteAssets])

  useEffect(() => {
    if (menuOpen) {
      menuPanelRef.current?.focus()
    } else if (menuWasOpen.current) {
      menuButtonRef.current?.focus()
    }
    menuWasOpen.current = menuOpen
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const favoriteSet = new Set(favoriteAssets)
  const orderedAssets = [
    ...assets.filter((asset) => favoriteSet.has(assetKey(asset))),
    ...assets.filter((asset) => !favoriteSet.has(assetKey(asset))),
  ]

  function toggleFavorite(asset: MarketAsset) {
    const key = assetKey(asset)
    setFavoriteAssets((currentFavorites) =>
      currentFavorites.includes(key)
        ? currentFavorites.filter((favorite) => favorite !== key)
        : [...currentFavorites, key],
    )
  }

  return (
    <main className="market-app">
      <header className="topbar">
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'profile-menu' : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <h1>CryptoTracker Lite</h1>
      </header>

      {menuOpen && (
        <div className="drawer-overlay">
          <button
            className="drawer-backdrop"
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            ref={menuPanelRef}
            id="profile-menu"
            className="side-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            tabIndex={-1}
          >
            <div className="profile-summary">
              <div className="profile-avatar">
                <svg viewBox="0 0 96 96" role="img" aria-label={`Imagen de ${PROFILE.name}`}>
                  <circle cx="48" cy="48" r="48" fill="#353535" />
                  <path
                    d="M20 83c2-16 13-24 28-24s26 8 28 24"
                    fill="#a5a5a5"
                  />
                  <ellipse cx="48" cy="38" rx="19" ry="23" fill="#d0d0d0" />
                  <path
                    d="M28 39c-2-21 8-31 21-31 14 0 22 11 19 31l-5-8c-8 1-20-2-27-8z"
                    fill="#252525"
                  />
                  <path d="M41 42h2m10 0h2" stroke="#252525" strokeWidth="3" />
                  <path
                    d="M42 51c4 4 8 4 12 0"
                    fill="none"
                    stroke="#555"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2>{PROFILE.name}</h2>
              <p className="profile-email">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="1" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                {PROFILE.email}
              </p>
            </div>
            <nav className="menu-options" aria-label="Opciones de perfil">
              <button className="menu-option favorites-option" type="button">
                <span className="menu-option-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
                  </svg>
                </span>
                <span>Favoritos</span>
                <span className="menu-chevron" aria-hidden="true">›</span>
              </button>
              <button className="menu-option profile-option" type="button">
                <span className="menu-option-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z" />
                  </svg>
                </span>
                <span>Perfil</span>
                <span className="menu-chevron" aria-hidden="true">›</span>
              </button>
              <button className="menu-option settings-option" type="button" disabled>
                <span className="menu-option-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="m19.4 13 .1-2 2-1.5-2-3.5-2.4.8a8 8 0 0 0-1.7-1L15 3h-4l-.4 2.8a8 8 0 0 0-1.7 1l-2.4-.8-2 3.5 2 1.5.1 2-2 1.5 2 3.5 2.4-.8a8 8 0 0 0 1.7 1L11 21h4l.4-2.8a8 8 0 0 0 1.7-1l2.4.8 2-3.5-2.1-1.5Z" />
                    <circle cx="13" cy="12" r="3" />
                  </svg>
                </span>
                <span>Configuración</span>
                <span className="menu-chevron" aria-hidden="true">›</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      <section className="market-list" aria-label="Mercado de criptomonedas">
        {loading && assets.length === 0 ? (
          <p className="list-state" role="status">
            <span className="spinner" aria-hidden="true" />
            Cargando datos del mercado…
          </p>
        ) : marketError && assets.length === 0 ? (
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
              {orderedAssets.map((asset) => {
                const isFavorite = favoriteSet.has(assetKey(asset))
                return (
                  <li
                    className={`asset-row${isFavorite ? ' is-favorite' : ''}`}
                    key={assetKey(asset)}
                  >
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
                    <button
                      className="favorite-toggle"
                      type="button"
                      aria-label={`${isFavorite ? 'Quitar de' : 'Añadir a'} favoritos: ${asset.name}`}
                      aria-pressed={isFavorite}
                      onClick={() => toggleFavorite(asset)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
            {loading && (
              <p className="refresh-status" role="status">
                Actualizando datos…
              </p>
            )}
            {marketError && (
              <p
                className="inline-warning"
                role={marketError === 'rate-limit' ? 'alert' : 'status'}
              >
                {marketError === 'rate-limit'
                  ? 'La API de CoinGecko alcanzó el límite de solicitudes. Se conservan los datos y se volverá a intentar automáticamente en 10 segundos.'
                  : 'No se pudieron actualizar los datos del mercado. Se muestran los últimos datos recibidos.'}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

function readFavoriteAssets() {
  try {
    const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (storedFavorites === null) return []

    const parsedFavorites: unknown = JSON.parse(storedFavorites)
    if (
      !Array.isArray(parsedFavorites) ||
      !parsedFavorites.every((favorite): favorite is string => typeof favorite === 'string')
    ) {
      throw new Error('La lista guardada de monedas favoritas no es válida.')
    }
    return parsedFavorites
  } catch (storageError) {
    console.error('No se pudieron restaurar las monedas favoritas.', storageError)
    return []
  }
}

function assetKey(asset: MarketAsset) {
  return JSON.stringify([asset.symbol, asset.name])
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
