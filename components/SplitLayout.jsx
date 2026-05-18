'use client'

import { useState } from 'react'

export default function SplitLayout({ leftPanel, rightPanel }) {
  const [leftWidth, setLeftWidth] = useState(42) // percentage
  const [isDragging, setIsDragging] = useState(false)

  const handleDividerMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)

    const startX = e.clientX
    const startWidth = leftWidth

    const onMouseMove = (e) => {
      const containerWidth = window.innerWidth
      const delta = ((e.clientX - startX) / containerWidth) * 100
      const newWidth = Math.min(Math.max(startWidth + delta, 28), 65)
      setLeftWidth(newWidth)
    }

    const onMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        paddingTop: '60px', // header height
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          width: `${leftWidth}%`,
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          flexShrink: 0,
          transition: isDragging ? 'none' : 'width 0.1s ease',
        }}
      >
        {/* Left panel header bar */}
        <div style={{
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Input
            </span>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171', opacity: 0.7 }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', opacity: 0.7 }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', opacity: 0.7 }} />
          </div>
        </div>

        {/* Left panel content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {leftPanel}
        </div>
      </div>

      {/* DRAGGABLE DIVIDER */}
      <div
        onMouseDown={handleDividerMouseDown}
        style={{
          width: '5px',
          background: isDragging ? 'var(--accent-primary)' : 'var(--border-subtle)',
          cursor: 'col-resize',
          flexShrink: 0,
          position: 'relative',
          transition: isDragging ? 'none' : 'background 0.2s ease',
          zIndex: 10,
        }}
        onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = 'var(--border-active)' }}
        onMouseLeave={e => { if (!isDragging) e.currentTarget.style.background = 'var(--border-subtle)' }}
      >
        {/* Drag handle dots */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: '3px', height: '3px',
              borderRadius: '50%',
              background: isDragging ? 'var(--accent-primary)' : 'var(--border-active)',
              transition: 'background 0.2s ease',
            }} />
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Right panel header bar */}
        <div style={{
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          background: 'var(--bg-panel)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-tertiary), var(--success))',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Output
            </span>
          </div>
          {/* Placeholder for tabs — Phase 4 will fill this */}
          <div style={{
            display: 'flex',
            gap: '4px',
          }}>
            {['Code', 'Preview'].map((tab, i) => (
              <div key={tab} style={{
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                color: i === 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                background: i === 0 ? 'rgba(124,106,255,0.1)' : 'transparent',
                border: i === 0 ? '1px solid rgba(124,106,255,0.2)' : '1px solid transparent',
                cursor: 'pointer',
              }}>
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {rightPanel}
        </div>
      </div>
    </div>
  )
}