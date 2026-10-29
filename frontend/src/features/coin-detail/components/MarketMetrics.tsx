import type { MarketAsset } from '../../../shared/market'
import { formatMoney } from '../../../shared/marketFormatters'

interface MarketMetricsProps {
  asset: MarketAsset
}

function MarketMetrics({ asset }: MarketMetricsProps) {
  const metrics = [
    { label: 'Máximo 24h', value: asset.high24h },
    { label: 'Mínimo 24h', value: asset.low24h },
    { label: 'Capitalización', value: asset.marketCap },
    { label: 'Volumen 24h', value: asset.totalVolume24h },
  ]

  return (
    <div className="detail-metrics" aria-label="Métricas de mercado">
      {metrics
        .filter((metric) => metric.value !== null)
        .map((metric) => (
          <article className="detail-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{formatMoney(metric.value, 'USD')}</strong>
          </article>
        ))}
    </div>
  )
}

export default MarketMetrics
