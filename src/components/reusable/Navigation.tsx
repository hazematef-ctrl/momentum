import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const { user, isGuest, logout } = useAuth()
  const displayName = user?.name ?? (isGuest ? 'Guest' : 'Momentum user')
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sage-pale text-sage-deep'
        : 'text-slate-soft hover:bg-cream hover:text-ink'
    }`

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
  }

  async function handleLogout() {
    setLogoutError(null)
    try {
      await logout()
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sand-deep/80 bg-white/70 px-5 py-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-b-0 md:px-6 md:py-8">
      <div className="flex items-center justify-between md:block">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.15em] text-ink uppercase md:mb-12"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-sage-pale text-sage-deep">
            <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" aria-hidden="true">
              <path
                d="M19.5 4.5c-7.2.1-12.3 2.5-12.3 8.2 0 2.4 1.6 4.1 3.8 4.1 5.3 0 7.4-5.9 8.5-12.3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M4.5 20c2.4-4.1 5.8-6.8 10.2-8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          Momentum
        </Link>
        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-sand-deep bg-cream/70 text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:hidden"
        >
          {isMobileMenuOpen ? (
            <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
              <path d="M3.5 5.5h13m-13 4.5h13m-13 4.5h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      <nav
        id="primary-navigation"
        aria-label="Main navigation"
        className={`${isMobileMenuOpen ? 'mt-5 flex' : 'hidden'} flex-col gap-1 md:mt-0 md:flex`}
      >
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-soft/80 uppercase">
          Workspace
        </p>
        <NavLink to="/" end onClick={closeMobileMenu} className={linkClass}>
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
            <path d="m3.5 8.5 6.5-5 6.5 5v7a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M7.5 16.5v-5h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/mytasks" onClick={closeMobileMenu} className={linkClass}>
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
            <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          My Tasks
        </NavLink>
        <NavLink to="/schedule" onClick={closeMobileMenu} className={linkClass}>
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
            <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6.5 3v3M13.5 3v3M3 8h14m-9 3v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Schedule
        </NavLink>
        <NavLink to="/favourites" onClick={closeMobileMenu} className={linkClass}>
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
            <path d="m10 2.8 2.1 4.4 4.9.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9L3 7.9l4.9-.7L10 2.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Favourites
        </NavLink>
      </nav>

      <Link
        to="/profile"
        onClick={closeMobileMenu}
        className={`${isMobileMenuOpen ? 'mt-5 flex' : 'hidden'} items-center gap-3 rounded-2xl border border-sand-deep/70 bg-cream/70 p-3 transition-colors hover:bg-cream md:mt-auto md:flex`}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-deep text-xs font-semibold tracking-wide text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{displayName}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-soft">
            {user?.email ?? 'Guest session'}
          </span>
        </span>
        <svg viewBox="0 0 20 20" fill="none" className="size-4 text-slate-soft" aria-hidden="true">
          <path d="m8 4 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      {logoutError && <p role="alert" className="mt-3 text-xs text-[#783f35]">{logoutError}</p>}
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="mt-3 min-h-10 cursor-pointer rounded-xl px-3 text-left text-sm font-medium text-slate-soft transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      >
        {user ? 'Log out' : 'Exit guest session'}
      </button>
    </aside>
  )
}

export default Navigation
