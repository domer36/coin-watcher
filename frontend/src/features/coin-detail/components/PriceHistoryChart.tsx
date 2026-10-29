import type { MarketPricePoint } from '../../../shared/market'

interface PriceHistoryChartProps {
  points: MarketPricePoint[]
}

function PriceHistoryChart({ points }: PriceHistoryChartProps) {
  const path = buildChartPath(points)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  return (
    <div className="history-chart">
      <svg
        viewBox="0 0 640 260"
        role="img"
        aria-label="Gráfico del precio en USD durante los últimos 7 días"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3].map((line) => {
          const y = 20 + line * 64
          return <line key={line} x1="52" x2="630" y1={y} y2={y} className="chart-grid" />
        })}
        <path d={`${path} L630 212 L52 212 Z`} className="chart-area" />
        <path d={path} className="chart-line" />
      </svg>
      <div className="history-chart-labels" aria-hidden="true">
        <span>{formatChartDate(firstPoint.timestamp)}</span>
        <span>{formatChartDate(lastPoint.timestamp)}</span>
      </div>
    </div>
  )
}

function buildChartPath(points: MarketPricePoint[]) {
  const prices = points.map((point) => point.price)
  const minimum = Math.min(...prices)
  const range = Math.max(...prices) - minimum || Math.abs(minimum) * 0.01 || 1

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 52 : 52 + (index / (points.length - 1)) * 578
      const y = 212 - ((point.price - minimum) / range) * 192
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function formatChartDate(timestamp: number) {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' }).format(timestamp)
}

export default PriceHistoryChart
