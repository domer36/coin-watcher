export interface MarketAsset {
  id: string
  name: string
  symbol: string
  imageUrl: string
  price: number | null
  priceChangePercentage24h: number | null
  marketCap: number | null
  high24h: number | null
  low24h: number | null
  totalVolume24h: number | null
}

export interface MarketDetail extends MarketAsset {
  priceHistory: MarketPricePoint[] | null
}

export interface MarketPricePoint {
  timestamp: number
  price: number
}

export interface MarketPage {
  data: MarketAsset[]
}

export type MarketError = 'initial' | 'rate-limit' | 'refresh' | null

export const REFRESH_INTERVAL = 10_000

export class MarketRequestError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Market request failed (${status})`)
    this.name = 'MarketRequestError'
    this.status = status
  }
}
