'use client'

import toast from 'react-hot-toast'

const FRAMEWORK_EXT = {
  react:  { ext: 'jsx', label: 'JSX' },
  nextjs: { ext: 'jsx', label: 'Next.js' },
  vue:    { ext: 'vue', label: 'Vue' },
}

const STYLE_LABEL = {
  tailwind:   'Tailwind',
  cssmodules: 'CSS Modules',
  styled:     'Styled',
}

export default function ActionToolbar({ code, framework = 'react', styling = 'tailwind', tokenCount, status }) {
  const { ext, label } = FRAMEWORK_EXT[framework] || FRAMEWORK_EXT.react
  const styleLabel = STYLE_LABEL[styling] || styling
  const hasCode = !!code && status === 'done'

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!hasCode) return
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Copied to clipboard!', {
        duration: 2000,
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
        },
        iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' },
      })
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast.success('Copied!', { duration: 2000 })
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!hasCode) return
    const filename = `component.${ext}`
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded as ${filename}`, {
      duration: 2500,
      style: {
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        padding: '10px 14px',
        borderRadius: '10px',
      },
      icon: '📥',
    })
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexShrink: 0,
    }}>
      {/* Stack badges — visible when done */}
      {status === 'done' && (
        <div style={{ display: 'flex', gap: '4px', marginRight: '4px' }}>
          <Badge label={label} color="var(--accent-primary)" />
          <Badge label={styleLabel} color="var(--accent-tertiary)" />
          {tokenCount > 0 && (
            <Badge label={`${(tokenCount / 1000).toFixed(1)}k chars`} color="var(--text-muted)" />
          )}
        </div>
      )}

      {/* Copy button */}
      <ToolbarButton
        onClick={handleCopy}
        disabled={!hasCode}
        title="Copy code"
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        }
        label="Copy"
      />

      {/* Download button */}
      <ToolbarButton
        onClick={handleDownload}
        disabled={!hasCode}
        title={`Download as .${ext}`}
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        }
        label={`.${ext}`}
      />
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      padding: '2px 7px',
      borderRadius: '5px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      fontWeight: 600,
      color,
      letterSpacing: '0.3px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function ToolbarButton({ onClick, disabled, title, icon, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        borderRadius: '7px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--border-active)'
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.style.background = 'var(--bg-hover)'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.background = 'var(--bg-card)'
        }
      }}
    >
      {icon}
      {label}
    </button>
  )
}