const API_PATH = '/api/markets'

export function fetchCoinDetail(
  assetId: string,
  signal: AbortSignal,
): Promise<Response> {
  const params = new URLSearchParams({ currency: 'USD' })
  return fetch(
    `${API_PATH}/${encodeURIComponent(assetId)}?${params}`,
    { signal },
  )
}
