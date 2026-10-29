import type { MarketAsset, MarketError } from '../../../shared/market'
import {
  assetKey,
  changeClass,
  formatMoney,
  formatPercentage,
} from '../../../shared/marketFormatters'

interface MarketAssetListProps {
  assets: MarketAsset[]
  favoriteAssets: Set<string>
  loading: boolean
  error: MarketError
  onSelectAsset: (asset: MarketAsset) => void
  onToggleFavorite: (asset: MarketAsset) => void
  onRetry: () => void
}

function MarketAssetList({
  assets,
  favoriteAssets,
  loading,
  error,
  onSelectAsset,
  onToggleFavorite,
  onRetry,
}: MarketAssetListProps) {
  if (loading && assets.length === 0) {
    return (
      <p className="list-state" role="status">
        <span className="spinner" aria-hidden="true" />
        Cargando datos del mercado…
      </p>
    )
  }

  if (error && assets.length === 0) {
    return (
      <div className="list-state error-state" role="alert">
        <span className="error-mark" aria-hidden="true">!</span>
        <h2>Hubo un problema 😢</h2>
        <p>
          No se pudieron cargar los datos del mercado. Por favor, espera unos momentos y
          vuelve a intentarlo.
        </p>
        <button className="retry-button" type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (assets.length === 0) {
    return <p className="list-state">No hay datos de mercado disponibles.</p>
  }

  const orderedAssets = [
    ...assets.filter((asset) => favoriteAssets.has(assetKey(asset))),
    ...assets.filter((asset) => !favoriteAssets.has(assetKey(asset))),
  ]

  return (
    <>
      <ul className="asset-list">
        {orderedAssets.map((asset) => {
          const isFavorite = favoriteAssets.has(assetKey(asset))
          return (
            <li className={`asset-row${isFavorite ? ' is-favorite' : ''}`} key={asset.id}>
              <button
                className="asset-open"
                type="button"
                aria-label={`Ver detalle de ${asset.name}`}
                onClick={() => onSelectAsset(asset)}
              >
                <span className="asset-identity">
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
                  <span className="asset-labels">
                    <span className="asset-name">{asset.name}</span>
                    <span className="asset-symbol">{asset.symbol}</span>
                  </span>
                </span>
                <span className="asset-market-data">
                  <span className="asset-price">{formatMoney(asset.price, 'USD')}</span>
                  <span className={`asset-change ${changeClass(asset.priceChangePercentage24h)}`}>
                    {formatPercentage(asset.priceChangePercentage24h)}
                  </span>
                </span>
              </button>
              <button
                className="favorite-toggle"
                type="button"
                aria-label={`${isFavorite ? 'Quitar de' : 'Añadir a'} favoritos: ${asset.name}`}
                aria-pressed={isFavorite}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleFavorite(asset)
                }}
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
      {error && (
        <p className="inline-warning" role={error === 'rate-limit' ? 'alert' : 'status'}>
          {error === 'rate-limit'
            ? 'La API de CoinGecko alcanzó el límite de solicitudes. Se conservan los datos y se volverá a intentar automáticamente en 10 segundos.'
            : 'No se pudieron actualizar los datos del mercado. Se muestran los últimos datos recibidos.'}
        </p>
      )}
    </>
  )
}

export default MarketAssetList
