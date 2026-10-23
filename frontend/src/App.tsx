import { useEffect, useMemo, useState } from 'react'
import './App.css'

interface MarketAsset {
  name: string
  symbol: string
  price: number | null
  priceChangePercentage24h: number | null
  marketCap: number | null
}

interface MarketPage {
  data: MarketAsset[]
  page: number
  perPage: number
  hasMore: boolean
}

type SortBy = 'marketCap' | 'price' | 'name'

const API_PATH = '/api/markets'

function App() {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [currencies, setCurrencies] = useState(['USD', 'EUR'])
  const [currency, setCurrency] = useState('USD')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('marketCap')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currencyError, setCurrencyError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadMarkets() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          currency,
          page: String(page),
          perPage: '20',
        })
        const response = await fetch(`${API_PATH}?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Market request failed (${response.status})`)
        }

        const result = (await response.json()) as MarketPage
        setAssets(result.data)
        setHasMore(result.hasMore)
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar los datos del mercado.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadMarkets()
    return () => controller.abort()
  }, [currency, page, retryCount])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCurrencies() {
      try {
        const response = await fetch(`${API_PATH}/currencies`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Currency request failed (${response.status})`)
        }
        const result = (await response.json()) as string[]
        setCurrencies([...new Set(['USD', ...result])])
        setCurrencyError('')
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        setCurrencyError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las monedas de cotización.',
        )
      }
    }

    void loadCurrencies()
    return () => controller.abort()
  }, [])

  const visibleAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    const filtered = assets.filter(
      (asset) =>
        asset.name.toLocaleLowerCase().includes(normalizedSearch) ||
        asset.symbol.toLocaleLowerCase().includes(normalizedSearch),
    )

    return [...filtered].sort((left, right) => {
      if (sortBy === 'name') {
        return left.name.localeCompare(right.name)
      }

      const leftValue = left[sortBy]
      const rightValue = right[sortBy]
      if (leftValue === null) return 1
      if (rightValue === null) return -1
      return rightValue - leftValue
    })
  }, [assets, search, sortBy])

  function updateCurrency(nextCurrency: string) {
    if (nextCurrency !== currency) {
      setAssets([])
      setHasMore(false)
    }
    setCurrency(nextCurrency)
    setPage(1)
  }

  function navigateToPage(nextPage: number) {
    setAssets([])
    setHasMore(false)
    setPage(nextPage)
  }

  function updateSortBy(nextSortBy: string) {
    if (nextSortBy === 'marketCap' || nextSortBy === 'price' || nextSortBy === 'name') {
      setSortBy(nextSortBy)
    }
  }

  return (
    <main className="market-app">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Inicio de Coinwatch">
          <span className="brand-mark" aria-hidden="true">₿</span>
          <span>coinwatch</span>
        </a>
        <div className="topbar-meta">
          <span className="market-status"><span /> Mercado</span>
          <span className="topbar-divider" />
          <span className="topbar-label">Resumen del mercado</span>
        </div>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">MERCADO DE CRIPTOMONEDAS</p>
          <h1>Resumen del mercado</h1>
          <p className="page-description">
            Sigue los precios y compara las principales criptomonedas por capitalización.
          </p>
        </div>
        <div className="heading-note">
          <span className="heading-note-icon" aria-hidden="true">↗</span>
          <span>Datos del mercado<br /><strong>Actualizados al consultar</strong></span>
        </div>
      </section>

      <section className="market-panel" aria-label="Mercado de criptomonedas">
        <div className="panel-toolbar">
          <div className="panel-title">
            <h2>Principales criptomonedas</h2>
            <span className="result-count">
              {visibleAssets.length} {visibleAssets.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>
          <div className="controls">
            <label className="search-control">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="8.8" cy="8.8" r="5.7" />
                <path d="m13 13 4 4" />
              </svg>
              <input
                type="search"
                placeholder="Buscar monedas"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  if (page !== 1) {
                    setAssets([])
                    setHasMore(false)
                  }
                  setPage(1)
                }}
                aria-label="Buscar monedas por nombre o símbolo"
              />
              <kbd>/</kbd>
            </label>
            <label className="select-control">
              <span className="control-label">Ordenar</span>
              <select
                value={sortBy}
                onChange={(event) => updateSortBy(event.target.value)}
                aria-label="Ordenar criptomonedas"
              >
                <option value="marketCap">Capitalización</option>
                <option value="price">Precio</option>
                <option value="name">Nombre</option>
              </select>
            </label>
            <label className="select-control currency-select">
              <span className="control-label">Moneda</span>
              <select
                value={currency}
                onChange={(event) => updateCurrency(event.target.value)}
                aria-label="Moneda de cotización"
              >
                {currencies.map((availableCurrency) => (
                  <option key={availableCurrency} value={availableCurrency}>
                    {availableCurrency}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {currencyError && (
          <p className="inline-warning" role="status">
            No se pudieron cargar las monedas de cotización. {currencyError}
          </p>
        )}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="rank-column">#</th>
                <th className="asset-heading">Nombre</th>
                <th className="numeric-heading">Precio</th>
                <th className="numeric-heading">Variación 24 h</th>
                <th className="numeric-heading">Capitalización</th>
              </tr>
            </thead>
            <tbody>
              {loading && assets.length === 0 ? (
                <tr>
                  <td className="table-state" colSpan={5}>
                    <span className="spinner" aria-hidden="true" />
                    Cargando datos del mercado…
                  </td>
                </tr>
              ) : error && assets.length === 0 ? (
                <tr>
                  <td className="table-state error-state" colSpan={5}>
                    <strong>No se pudo cargar el mercado.</strong>
                    <span>{error}</span>
                    <button
                      className="retry-button"
                      type="button"
                      onClick={() => setRetryCount((count) => count + 1)}
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : visibleAssets.length === 0 ? (
                <tr>
                  <td className="table-state" colSpan={5}>
                    {search
                      ? 'No hay criptomonedas que coincidan con la búsqueda.'
                      : 'No hay datos de mercado disponibles.'}
                  </td>
                </tr>
              ) : (
                visibleAssets.map((asset, index) => (
                  <tr key={`${asset.symbol}-${asset.name}`}>
                    <td className="rank-column">{(page - 1) * 20 + index + 1}</td>
                    <td>
                      <div className="asset-cell">
                        <span className="coin-icon" aria-hidden="true">
                          {asset.symbol.slice(0, 1)}
                        </span>
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-symbol">{asset.symbol}</span>
                      </div>
                    </td>
                    <td className="numeric-cell price-cell">
                      {formatMoney(asset.price, currency)}
                    </td>
                    <td
                      className={`numeric-cell change-cell ${changeClass(asset.priceChangePercentage24h)}`}
                    >
                      {formatPercentage(asset.priceChangePercentage24h)}
                    </td>
                    <td className="numeric-cell cap-cell">
                      {formatMoney(asset.marketCap, currency, true)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="panel-footer">
          <span className="page-indicator">
            Página <strong>{page}</strong>
            {loading && assets.length > 0 && (
              <span className="refreshing"> · Actualizando</span>
            )}
          </span>
          <nav className="pagination" aria-label="Páginas del mercado">
            <button
              type="button"
              className="page-button"
              onClick={() => navigateToPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              aria-label="Página anterior"
            >
              <span aria-hidden="true">‹</span> Anterior
            </button>
            <button
              type="button"
              className="page-button next-button"
              onClick={() => navigateToPage(page + 1)}
              disabled={!hasMore || loading}
              aria-label="Página siguiente"
            >
              Siguiente <span aria-hidden="true">›</span>
            </button>
          </nav>
        </footer>
      </section>

      <footer className="site-footer">
        <span>Precios en {currency}. Datos de mercado con fines informativos.</span>
        <span>Coinwatch <span aria-hidden="true">·</span> Panel de mercado</span>
      </footer>
    </main>
  )
}

function formatMoney(value: number | null, currency: string, compact = false) {
  if (value === null) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 2 : 8,
    }).format(value)
  } catch {
    const amount = new Intl.NumberFormat('en-US', {
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 2 : 8,
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
