import { useState, useEffect, useContext, useRef, Fragment } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return scrolled
}

const NAV_LINKS = [
  { href: '#features',      label: 'Features' },
  { href: '#faq',           label: 'FAQ' },
]

export default function Navbar() {
  const { user, logout }  = useContext(AuthContext)
  const location          = useNavigate ? useLocation() : { pathname: '/' }
  const navigate          = useNavigate()
  const scrolled          = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef  = useRef(null)
  const isLanding = location.pathname === '/'

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* close menu/drop on route change */
  useEffect(() => {
    setMenuOpen(false)
    setDropOpen(false)
  }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  const avatarLetter =
    user?.username?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?'

  const smoothScroll = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        background:     scrolled ? 'rgba(7,11,20,0.92)' : 'rgba(7,11,20,0.60)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom:   scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        boxShadow:      scrolled ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* ── LEFT: Logo ── */}
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3"  y="3"  width="7" height="7" rx="1" />
              <rect x="14" y="3"  width="7" height="7" rx="1" />
              <rect x="3"  y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #60a5fa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            TaskFlow
          </span>
        </Link>

        {/* ── CENTER: Landing nav links (desktop only, unauthenticated) ── */}
        {isLanding && !user && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              flex: 1, justifyContent: 'center',
            }}
            className="nav-center-links"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => smoothScroll(href)}
                style={{
                  background: 'none', border: 'none',
                  padding: '7px 14px', borderRadius: '99px',
                  fontSize: '14px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* spacer when no center links */}
        {(!isLanding || user) && <div style={{ flex: 1 }} />}

        {/* ── RIGHT: Auth actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!user ? (
            <Fragment>
              {/* Desktop sign-in */}
              <Link
                to="/login"
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'transparent',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                className="nav-signin-link"
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'transparent' }}
              >
                Sign in
              </Link>

              <Link
                to="/register"
                style={{
                  padding: '8px 18px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 600,
                  color: '#fff', textDecoration: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.35)' }}
              >
                Get started
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'none', /* shown via CSS below */
                  padding: '8px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                className="nav-hamburger"
                aria-label="Toggle menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {menuOpen
                    ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                  }
                </svg>
              </button>
            </Fragment>
          ) : (
            /* Authenticated user controls */
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 12px 5px 5px',
                  background: dropOpen ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '99px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', color: '#fff', flexShrink: 0,
                  }}
                >
                  {avatarLetter}
                </div>
                <span
                  style={{
                    fontSize: '13px', fontWeight: 600,
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: '100px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {user?.username || user?.email?.split('@')[0]}
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"
                  style={{
                    transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s', flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropOpen && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: '200px', borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 300,
                    background: 'rgba(15,22,40,0.97)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    animation: 'navDropIn 0.18s ease both',
                  }}
                >
                  {/* Header */}
                  <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      {user?.username || 'User'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Links */}
                  <div style={{ padding: '6px' }}>
                    {[
                      { label: 'Dashboard', to: '/dashboard', icon: '⊞' },
                      { label: 'Settings',  to: '/settings',  icon: '⚙' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 12px', borderRadius: '10px',
                          fontSize: '13px', fontWeight: 500,
                          color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                      >
                        <span style={{ fontSize: '14px' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', padding: '9px 12px', borderRadius: '10px',
                        fontSize: '13px', fontWeight: 500, color: '#f43f5e',
                        background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.10)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: '14px' }}>↩</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile menu (unauthenticated + landing) ── */}
      {menuOpen && isLanding && !user && (
        <div
          style={{
            padding: '12px 16px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(7,11,20,0.97)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => smoothScroll(href)}
                style={{
                  background: 'none', border: 'none',
                  padding: '10px 14px', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login"    style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Sign in</Link>
            <Link to="/register" style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Get started</Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Show hamburger + hide text links on mobile */
        @media (max-width: 640px) {
          .nav-center-links  { display: none !important; }
          .nav-signin-link   { display: none !important; }
          .nav-hamburger     { display: flex !important; }
        }
      `}</style>
    </header>
  )
}