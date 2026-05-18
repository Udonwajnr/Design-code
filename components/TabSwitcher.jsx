'use client'

const TABS = [
  {
    id: 'code',
    label: 'Code',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    requiresDone:  false,
    requiresImage: false,
    tooltip: null,
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    requiresDone:  true,
    requiresImage: false,
    tooltip: 'Generate code first',
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M12 3v18"/>
      </svg>
    ),
    requiresDone:  true,
    requiresImage: true,
    tooltip: 'Generate code and upload image first',
  },
]

export default function TabSwitcher({ activeTab, onChange, hasCode, hasImage }) {
  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      background: 'var(--bg-secondary)',
      padding: '3px',
      borderRadius: '9px',
      border: '1px solid var(--border-subtle)',
    }}>
      {TABS.map(tab => {
        const isDisabled = (tab.requiresDone && !hasCode) || (tab.requiresImage && !hasImage)
        const isActive   = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onChange(tab.id)}
            disabled={isDisabled}
            title={isDisabled ? tab.tooltip : tab.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 11px',
              borderRadius: '6px',
              border: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive
                ? tab.id === 'compare'
                  ? 'var(--accent-secondary)'
                  : 'var(--accent-primary)'
                : isDisabled
                ? 'var(--text-muted)'
                : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
              opacity: isDisabled ? 0.4 : 1,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!isActive && !isDisabled) {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'var(--bg-hover)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive && !isDisabled) {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}