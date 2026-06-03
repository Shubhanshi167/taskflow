// Simple surface card with optional hover lift
// Props:
//   hover:   boolean — enables lift on hover
//   padding: CSS padding string (default '24px')
//   accent:  CSS color — draws a colored top border

import { useState } from 'react'

export default function Card({
  children,
  hover = false,
  padding = '24px',
  accent,
  style: extra = {},
  onClick,
  ...props
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderTop: accent ? `3px solid ${accent}` : undefined,
        borderRadius: 'var(--radius-lg)',
        padding,
        transition: 'var(--transition-base)',
        transform: hover && hovered ? 'translateY(-3px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...extra,
      }}
      {...props}
    >
      {children}
    </div>
  )
}