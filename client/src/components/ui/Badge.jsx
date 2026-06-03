// Colored pill badge
// Props:
//   color:   'indigo'|'green'|'amber'|'red'|'blue'|'slate'
//   size:    'sm'|'md'

const COLORS = {
  indigo: { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8' },
  green:  { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  amber:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
  red:    { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
  blue:   { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  slate:  { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
}

export default function Badge({ children, color = 'slate', size = 'md', style: extra = {} }) {
  const c = COLORS[color] || COLORS.slate
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: c.bg,
      color: c.text,
      fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
      fontWeight: '600',
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      borderRadius: 'var(--radius-full)',
      ...extra,
    }}>
      {children}
    </span>
  )
}