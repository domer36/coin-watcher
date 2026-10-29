const FAVORITES_STORAGE_KEY = 'coin-watcher:favorites'

export function readFavoriteAssets(): string[] {
  try {
    const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (storedFavorites === null) return []

    const parsedFavorites: unknown = JSON.parse(storedFavorites)
    if (
      !Array.isArray(parsedFavorites) ||
      !parsedFavorites.every((favorite): favorite is string => typeof favorite === 'string')
    ) {
      throw new Error('La lista guardada de monedas favoritas no es válida.')
    }
    return parsedFavorites
  } catch (storageError) {
    console.error('No se pudieron restaurar las monedas favoritas.', storageError)
    return []
  }
}

export function writeFavoriteAssets(favorites: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  } catch (storageError) {
    console.error('No se pudieron guardar las monedas favoritas.', storageError)
  }
}
