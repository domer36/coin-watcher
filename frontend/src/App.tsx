import { useEffect, useState } from 'react'
import CoinDetailView from './features/coin-detail/CoinDetailView'
import MarketView from './features/market/MarketView'
import {
  readFavoriteAssets,
  writeFavoriteAssets,
} from './features/market/services/favoritesService'
import type { MarketAsset } from './shared/market'
import { assetKey } from './shared/marketFormatters'
import './App.css'

function App() {
  const [favoriteAssets, setFavoriteAssets] = useState(readFavoriteAssets)
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null)

  useEffect(() => {
    writeFavoriteAssets(favoriteAssets)
  }, [favoriteAssets])

  function toggleFavorite(asset: MarketAsset) {
    const key = assetKey(asset)
    setFavoriteAssets((currentFavorites) =>
      currentFavorites.includes(key)
        ? currentFavorites.filter((favorite) => favorite !== key)
        : [...currentFavorites, key],
    )
  }

  function returnToList() {
    setSelectedAsset(null)
    window.scrollTo(0, 0)
  }

  const favoriteSet = new Set(favoriteAssets)

  return (
    <main className="market-app">
      {selectedAsset ? (
        <CoinDetailView
          asset={selectedAsset}
          isFavorite={favoriteSet.has(assetKey(selectedAsset))}
          onBack={returnToList}
          onToggleFavorite={toggleFavorite}
        />
      ) : (
        <MarketView
          favoriteAssets={favoriteSet}
          onSelectAsset={setSelectedAsset}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </main>
  )
}

export default App
