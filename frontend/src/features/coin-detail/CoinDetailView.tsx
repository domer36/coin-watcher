import { useEffect, useState } from 'react'
import {
  MarketRequestError,
  REFRESH_INTERVAL,
  type MarketAsset,
  type MarketDetail,
} from '../../shared/market'
import { changeClass, formatMoney, formatPercentage } from '../../shared/marketFormatters'
import CoinIdentity from './components/CoinIdentity'
import MarketMetrics from './components/MarketMetrics'
import PriceHistoryChart from './components/PriceHistoryChart'
import { fetchCoinDetail } from './services/coinDetailService'

interface CoinDetailViewProps {
  asset: MarketAsset
  isFavorite: boolean
  onBack: () => void
  onToggleFavorite: (asset: MarketAsset) => void
}

function CoinDetailView({
  asset,
  isFavorite,
  onBack,
  onToggleFavorite,
}: CoinDetailViewProps) {
  const [marketDetail, setMarketDetail] = useState<MarketDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    let inFlight = false
    let controller: AbortController | undefined

    async function loadDetail() {
      if (inFlight) return

      inFlight = true
      const requestController = new AbortController()
      controller = requestController
      setDetailLoading(true)
      try {
        const response = await fetchCoinDetail(asset.id, requestController.signal)
        if (!response.ok) {
          throw new MarketRequestError(response.status)
        }
        const result = (await response.json()) as MarketDetail
        if (active) {
          setMarketDetail(result)
          setDetailError(false)
        }
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        if (active) {
          setDetailError(true)
        }
      } finally {
        inFlight = false
        if (controller === requestController) {
          controller = undefined
        }
        if (active) {
          setDetailLoading(false)
        }
      }
    }

    void loadDetail()
    const intervalId = window.setInterval(() => {
      void loadDetail()
    }, REFRESH_INTERVAL)

    return () => {
      active = false
      window.clearInterval(intervalId)
      controller?.abort()
    }
  }, [asset.id, retryCount])

  const displayedAsset = marketDetail ?? asset

  return (
    <>
      <header className="topbar detail-topbar">
        <button
          className="back-button"
          type="button"
          aria-label="Volver a la lista"
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1>Detalle</h1>
      </header>
      <section className="detail-view" aria-label={`Detalle de ${asset.name}`}>
        <CoinIdentity
          asset={asset}
          isFavorite={isFavorite}
          onToggleFavorite={() => onToggleFavorite(asset)}
        />
        <section className="detail-price" aria-label="Precio actual">
          <span className="detail-section-label">Precio actual</span>
          <div className="detail-price-row">
            <strong>{formatMoney(displayedAsset.price, 'USD')}</strong>
            <span className={`detail-change ${changeClass(displayedAsset.priceChangePercentage24h)}`}>
              {formatPercentage(displayedAsset.priceChangePercentage24h)}
            </span>
          </div>
        </section>
        <MarketMetrics asset={displayedAsset} />
        <section className="history-card" aria-label="Precio histórico">
          <h2>Precio histórico (7 días)</h2>
          {detailLoading && !marketDetail ? (
            <p className="history-state" role="status">Cargando historial…</p>
          ) : detailError && !marketDetail ? (
            <div className="history-state error-state" role="alert">
              <p>No se pudo cargar el detalle de esta moneda.</p>
              <button
                className="retry-button"
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Reintentar
              </button>
            </div>
          ) : marketDetail?.priceHistory?.length ? (
            <PriceHistoryChart points={marketDetail.priceHistory} />
          ) : marketDetail ? (
            <p className="history-state">No disponible</p>
          ) : null}
        </section>
        {detailError && marketDetail && (
          <p className="inline-warning detail-warning" role="status">
            No se pudieron actualizar los datos de esta moneda. Se muestran los últimos datos recibidos.
          </p>
        )}
      </section>
    </>
  )
}

export default CoinDetailView
