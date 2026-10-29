import { MarketRequestError, type MarketPage } from '../../../shared/market'

const API_PATH = '/api/markets'

export async function fetchMarkets(signal: AbortSignal): Promise<MarketPage> {
  const params = new URLSearchParams({
    currency: 'USD',
    page: '1',
    perPage: '20',
  })
  const response = await fetch(`${API_PATH}?${params}`, { signal })
  if (!response.ok) {
    throw new MarketRequestError(response.status)
  }

  return response.json() as Promise<MarketPage>
}
