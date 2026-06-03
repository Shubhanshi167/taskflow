// Reusable Button component
// Props:
//   variant: 'primary' | 'secondary' | 'ghost' | 'danger'
//   size:    'sm' | 'md' | 'lg'
//   loading: boolean — shows spinner, disables click
//   icon:    JSX element shown before label
//   full:    boolean — width 100%
//   All standard button HTML attributes are forwarded

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition-base)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    textDecoration: 'none',
  },
  sizes: {
    sm:  { fontSize: 'var(--text-sm)',  padding: '6px 12px',  height: '32px' },
    md:  { fontSize: 'var(--text-base)', padding: '8px 16px', height: '38px' },
    lg:  { fontSize: 'var(--text-md)',  padding: '11px 22px', height: '44px' },
  },
  variants: {
    primary: {
      background: 'var(--brand-primary)',
      color: '#fff',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--bg-danger)',
      color: 'var(--color-danger)',
      border: '1px solid rgba(239,68,68,0.25)',
    },
  },
}

function Spinner() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14"
      style={{ animation: 'btn-spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor"
        strokeWidth="2" strokeDasharray="20" strokeDashoffset="8"
        strokeLinecap="round" opacity="0.8"
      />
    </svg>
  )
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon = null,
  full = false,
  style: extraStyle = {},
  onMouseEnter,
  onMouseLeave,
  disabled,
  ...props
}) {
  const [hovered, setHovered] = useState(false)

  // Hover tint overlays applied on top of variant
  const hoverOverlay = {
    primary:   { filter: hovered ? 'brightness(1.12)' : 'none' },
    secondary: { borderColor: hovered ? 'var(--border-strong)' : 'var(--border-default)', color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)' },
    ghost:     { background: hovered ? 'var(--bg-elevated)' : 'transparent', color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)' },
    danger:    { filter: hovered ? 'brightness(1.1)' : 'none' },
  }

  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      onMouseEnter={e => { setHovered(true);  onMouseEnter?.(e) }}
      onMouseLeave={e => { setHovered(false); onMouseLeave?.(e) }}
      style={{
        ...styles.base,
        ...styles.sizes[size],
        ...styles.variants[variant],
        ...hoverOverlay[variant],
        width: full ? '100%' : undefined,
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...extraStyle,
      }}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}

// Button needs useState
import { useState } from 'react'