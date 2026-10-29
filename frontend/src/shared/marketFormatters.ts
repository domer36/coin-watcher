import type { MarketAsset } from './market'

export function assetKey(asset: MarketAsset) {
  return JSON.stringify([asset.symbol, asset.name])
}

export function formatMoney(value: number | null, currency: string) {
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

export function formatPercentage(value: number | null) {
  if (value === null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function changeClass(value: number | null) {
  if (value === null || value === 0) return 'change-neutral'
  return value > 0 ? 'change-positive' : 'change-negative'
}
