import type { RefObject } from 'react'

interface MarketHeaderProps {
  menuOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onToggleMenu: () => void
}

function MarketHeader({ menuOpen, menuButtonRef, onToggleMenu }: MarketHeaderProps) {
  return (
    <header className="topbar">
      <button
        ref={menuButtonRef}
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? 'profile-menu' : undefined}
        onClick={onToggleMenu}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <h1>CryptoTracker Lite</h1>
    </header>
  )
}

export default MarketHeader
