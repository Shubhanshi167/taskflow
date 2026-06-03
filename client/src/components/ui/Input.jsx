// Reusable Input — supports text, password, email, date, textarea
// Props:
//   label:       string — shown above input
//   error:       string — shown below in red
//   hint:        string — shown below in muted
//   icon:        JSX — shown inside left of input
//   type:        standard HTML input types + 'textarea'
//   All other props forwarded to the input element

import { useState, forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, icon, type = 'text', style: extra = {}, ...props },
  ref
) {
  const [focused, setFocused] = useState(false)
  const isTextarea = type === 'textarea'
  const Tag = isTextarea ? 'textarea' : 'input'

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-surface)',
    border: `1px solid ${error ? 'var(--color-danger)' : focused ? 'var(--brand-primary)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-md)',
    padding: icon ? '9px 14px 9px 38px' : '9px 14px',
    fontSize: 'var(--text-base)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    resize: isTextarea ? 'vertical' : undefined,
    minHeight: isTextarea ? '88px' : undefined,
    colorScheme: 'dark',
    ...extra,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: error ? 'var(--color-danger)' : 'var(--text-secondary)',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--brand-secondary)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
            transition: 'color 0.15s',
          }}>
            {icon}
          </span>
        )}
        <Tag
          ref={ref}
          type={isTextarea ? undefined : type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '2px' }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
          {hint}
        </span>
      )}
    </div>
  )
})

export default Input