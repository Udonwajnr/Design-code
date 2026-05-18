'use client'

import { useState } from 'react'

const FRAMEWORK_LABEL = { react: 'React', nextjs: 'Next.js', vue: 'Vue 3' }
const STYLING_LABEL   = { tailwind: 'Tailwind', cssmodules: 'CSS Mod.', styled: 'Styled' }
const FRAMEWORK_COLOR = { react: '#38bdf8', nextjs: '#ffffff', vue: '#4ade80' }
const STYLING_COLOR   = { tailwind: '#7c6aff', cssmodules: '#fb923c', styled: '#f472b6' }

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)   return 'just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function HistoryCard({ entry, onRestore, onDelete, isActive }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete(entry.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
    }
  }

  return (
    <div
      onClick={() => onRestore(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false) }}
      style={{
        borderRadius: '12px',
        border: isActive
          ? '1px solid rgba(124,106,255,0.5)'
          : hovered
          ? '1px solid var(--border-default)'
          : '1px solid var(--border-subtle)',
        background: isActive
          ? 'rgba(124,106,255,0.07)'
          : hovered
          ? 'var(--bg-hover)'
          : 'var(--bg-card)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        position: 'relative',
        animation: 'slideUp 0.25s ease',
      }}
    >
      {/* Active indicator stripe */}
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '3px',
          background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-secondary))',
          borderRadius: '12px 0 0 12px',
        }} />
      )}

      <div style={{ display: 'flex', gap: '10px', padding: '10px 10px 10px 14px' }}>
        {/* Thumbnail */}
        <div style={{
          width: '52px', height: '52px', flexShrink: 0,
          borderRadius: '8px', overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {entry.imageDataURL ? (
            <img
              src={entry.imageDataURL}
              alt={entry.imageName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {/* Top row: badges + time + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Badge label={FRAMEWORK_LABEL[entry.framework] || entry.framework} color={FRAMEWORK_COLOR[entry.framework] || 'var(--text-muted)'} />
            <Badge label={STYLING_LABEL[entry.styling] || entry.styling} color={STYLING_COLOR[entry.styling] || 'var(--text-muted)'} />
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', flexShrink: 0 }}>
              {timeAgo(entry.timestamp)}
            </span>
            {/* Delete button */}
            <button
              onClick={handleDelete}
              title={confirmDelete ? 'Click again to confirm' : 'Delete'}
              style={{
                width: '20px', height: '20px', borderRadius: '5px',
                border: confirmDelete ? '1px solid rgba(248,113,113,0.4)' : '1px solid transparent',
                background: confirmDelete ? 'rgba(248,113,113,0.1)' : 'transparent',
                color: confirmDelete ? 'var(--error)' : 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s ease', padding: 0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {confirmDelete
                  ? <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>
                  : <><path d="M18 6L6 18M6 6l12 12"/></>
                }
              </svg>
            </button>
          </div>

          {/* File name */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {entry.imageName}
          </div>

          {/* Code preview snippet */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'var(--text-muted)', lineHeight: '1.4',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            opacity: 0.7,
          }}>
            {entry.codePreview || '// no preview'}
          </div>
        </div>
      </div>

      {/* Instructions strip if present */}
      {entry.instructions && (
        <div style={{
          padding: '5px 14px 8px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            "{entry.instructions.slice(0, 60)}{entry.instructions.length > 60 ? '…' : ''}"
          </span>
        </div>
      )}
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      padding: '1px 6px', borderRadius: '4px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-mono)', fontSize: '8px', fontWeight: 700,
      color, letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}