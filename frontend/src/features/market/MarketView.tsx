import { useEffect, useRef, useState } from 'react'
import {
  MarketRequestError,
  REFRESH_INTERVAL,
  type MarketAsset,
  type MarketError,
} from '../../shared/market'
import MarketAssetList from './components/MarketAssetList'
import MarketHeader from './components/MarketHeader'
import ProfileDrawer from './components/ProfileDrawer'
import { fetchMarkets } from './services/marketService'

interface MarketViewProps {
  favoriteAssets: Set<string>
  onSelectAsset: (asset: MarketAsset) => void
  onToggleFavorite: (asset: MarketAsset) => void
}

function MarketView({
  favoriteAssets,
  onSelectAsset,
  onToggleFavorite,
}: MarketViewProps) {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [marketError, setMarketError] = useState<MarketError>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
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
        const result = await fetchMarkets(requestController.signal)
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

  function selectAsset(asset: MarketAsset) {
    setMenuOpen(false)
    onSelectAsset(asset)
  }

  return (
    <>
      <MarketHeader
        menuOpen={menuOpen}
        menuButtonRef={menuButtonRef}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      {menuOpen && (
        <ProfileDrawer
          panelRef={menuPanelRef}
          onClose={() => setMenuOpen(false)}
        />
      )}
      <section className="market-list" aria-label="Mercado de criptomonedas">
        <MarketAssetList
          assets={assets}
          favoriteAssets={favoriteAssets}
          loading={loading}
          error={marketError}
          onSelectAsset={selectAsset}
          onToggleFavorite={onToggleFavorite}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </section>
    </>
  )
}

export default MarketView
