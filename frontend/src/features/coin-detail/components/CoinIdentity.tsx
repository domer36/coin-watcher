import type { MarketAsset } from '../../../shared/market'

interface CoinIdentityProps {
  asset: MarketAsset
  isFavorite: boolean
  onToggleFavorite: () => void
}

function CoinIdentity({ asset, isFavorite, onToggleFavorite }: CoinIdentityProps) {
  return (
    <div className="detail-identity">
      <span className="detail-coin-icon" aria-hidden="true">
        {asset.symbol.slice(0, 1)}
        <img
          src={asset.imageUrl}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
        />
      </span>
      <div className="detail-asset-labels">
        <h2>{asset.name}</h2>
        <span>{asset.symbol}</span>
      </div>
      <button
        className="detail-favorite-toggle"
        type="button"
        aria-label={`${isFavorite ? 'Quitar de' : 'Añadir a'} favoritos: ${asset.name}`}
        aria-pressed={isFavorite}
        onClick={onToggleFavorite}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />
        </svg>
      </button>
    </div>
  )
}

export default CoinIdentity
