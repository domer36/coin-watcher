import type { RefObject } from 'react'

const PROFILE = {
  name: 'Bryan Vazquez',
  email: 'bryan@correo.com',
}

interface ProfileDrawerProps {
  panelRef: RefObject<HTMLElement | null>
  onClose: () => void
}

function ProfileDrawer({ panelRef, onClose }: ProfileDrawerProps) {
  return (
    <div className="drawer-overlay">
      <button
        className="drawer-backdrop"
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        id="profile-menu"
        className="side-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        tabIndex={-1}
      >
        <div className="profile-summary">
          <div className="profile-avatar">
            <svg viewBox="0 0 96 96" role="img" aria-label={`Imagen de ${PROFILE.name}`}>
              <circle cx="48" cy="48" r="48" fill="#353535" />
              <path d="M20 83c2-16 13-24 28-24s26 8 28 24" fill="#a5a5a5" />
              <ellipse cx="48" cy="38" rx="19" ry="23" fill="#d0d0d0" />
              <path
                d="M28 39c-2-21 8-31 21-31 14 0 22 11 19 31l-5-8c-8 1-20-2-27-8z"
                fill="#252525"
              />
              <path d="M41 42h2m10 0h2" stroke="#252525" strokeWidth="3" />
              <path
                d="M42 51c4 4 8 4 12 0"
                fill="none"
                stroke="#555"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h2>{PROFILE.name}</h2>
          <p className="profile-email">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="1" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            {PROFILE.email}
          </p>
        </div>
        <nav className="menu-options" aria-label="Opciones de perfil">
          <button className="menu-option favorites-option" type="button">
            <span className="menu-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
              </svg>
            </span>
            <span>Favoritos</span>
            <span className="menu-chevron" aria-hidden="true">›</span>
          </button>
          <button className="menu-option profile-option" type="button">
            <span className="menu-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z" />
              </svg>
            </span>
            <span>Perfil</span>
            <span className="menu-chevron" aria-hidden="true">›</span>
          </button>
          <button className="menu-option settings-option" type="button" disabled>
            <span className="menu-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m19.4 13 .1-2 2-1.5-2-3.5-2.4.8a8 8 0 0 0-1.7-1L15 3h-4l-.4 2.8a8 8 0 0 0-1.7 1l-2.4-.8-2 3.5 2 1.5.1 2-2 1.5 2 3.5 2.4-.8a8 8 0 0 0 1.7 1L11 21h4l.4-2.8a8 8 0 0 0 1.7-1l2.4.8 2-3.5-2.1-1.5Z" />
                <circle cx="13" cy="12" r="3" />
              </svg>
            </span>
            <span>Configuración</span>
            <span className="menu-chevron" aria-hidden="true">›</span>
          </button>
        </nav>
      </aside>
    </div>
  )
}

export default ProfileDrawer
