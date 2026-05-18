'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const LivePreview = dynamic(() => import('./LivePreview'), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>Loading preview…</span>
    </div>
  ),
})

export default function CompareSlider({ code, image, isDark }) {
  const [splitPct,   setSplitPct]   = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isReady,    setIsReady]    = useState(false)
  const containerRef = useRef(null)

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  // ── Drag logic ──────────────────────────────────────────────────────────────
  const startDrag = useCallback((clientX) => {
    setIsDragging(true)

    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const pct = Math.min(Math.max(((x - rect.left) / rect.width) * 100, 5), 95)
      setSplitPct(pct)
    }

    const onUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onUp)
      document.body.style.cursor    = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend',  onUp)
    document.body.style.cursor    = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const onMouseDown = (e) => { e.preventDefault(); startDrag(e.clientX) }
  const onTouchStart = (e) => startDrag(e.touches[0].clientX)

  // Image source — handles both live File uploads and history data URLs
  const imgSrc = image?.url || null

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        userSelect: 'none',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* ── LEFT — Original screenshot ────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, bottom: 0,
        width: `${splitPct}%`,
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'width 0.05s ease',
      }}>
        {/* Label */}
        <Label text="Original" side="left" />

        {imgSrc ? (
          <div style={{
            width: '100%', height: '100%',
            background: 'repeating-conic-gradient(var(--bg-hover) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflowY: 'auto',
          }}>
            <img
              src={imgSrc}
              alt="Original design"
              style={{
                width: '100%',
                display: 'block',
                objectFit: 'contain',
                objectPosition: 'top',
              }}
              draggable={false}
            />
          </div>
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-secondary)', flexDirection:'column', gap:'12px', opacity:0.5 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)' }}>No image</span>
          </div>
        )}
      </div>

      {/* ── RIGHT — Live rendered preview ─────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0,
        left: `${splitPct}%`,
        right: 0,
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'left 0.05s ease',
      }}>
        {/* Label */}
        <Label text="Generated" side="right" />

        <LivePreview
          code={code}
          viewport="desktop"
          isDark={isDark}
          bare // strips the browser chrome frame in compare mode
        />
      </div>

      {/* ── Divider handle ────────────────────────────────────────────────── */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${splitPct}%`,
          transform: 'translateX(-50%)',
          width: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'col-resize',
          zIndex: 20,
          transition: isDragging ? 'none' : 'left 0.05s ease',
        }}
      >
        {/* Line */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: '50%',
          width: isDragging ? '3px' : '2px',
          background: isDragging
            ? 'var(--accent-primary)'
            : 'rgba(124,106,255,0.6)',
          transform: 'translateX(-50%)',
          transition: 'width 0.15s ease, background 0.15s ease',
          boxShadow: isDragging ? '0 0 12px rgba(124,106,255,0.5)' : 'none',
        }} />

        {/* Handle pill */}
        <div style={{
          position: 'relative',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isDragging
            ? 'var(--accent-primary)'
            : 'var(--bg-card)',
          border: `2px solid ${isDragging ? 'var(--accent-primary)' : 'rgba(124,106,255,0.5)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDragging
            ? '0 0 0 4px rgba(124,106,255,0.2), 0 4px 16px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.15s ease',
          zIndex: 1,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={isDragging ? 'white' : 'var(--accent-primary)'}
            strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>
          </svg>
        </div>

        {/* Percentage tooltip */}
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -48px)',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'var(--accent-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {Math.round(splitPct)}%
          </div>
        )}
      </div>

      {/* ── Keyboard hint (fades after 3s) ────────────────────────────────── */}
      <HintBadge />
    </div>
  )
}

// ── Side label ─────────────────────────────────────────────────────────────────
function Label({ text, side }) {
  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      ...(side === 'left' ? { left: '12px' } : { right: '12px' }),
      zIndex: 10,
      padding: '4px 10px',
      borderRadius: '99px',
      background: 'rgba(8,8,16,0.7)',
      backdropFilter: 'blur(6px)',
      border: '1px solid var(--border-default)',
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      fontWeight: 700,
      color: side === 'left' ? 'var(--text-secondary)' : 'var(--accent-primary)',
      letterSpacing: '0.3px',
      pointerEvents: 'none',
    }}>
      {text}
    </div>
  )
}

// ── Drag hint that fades out ───────────────────────────────────────────────────
function HintBadge() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      padding: '6px 14px',
      borderRadius: '99px',
      background: 'rgba(8,8,16,0.75)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border-default)',
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      pointerEvents: 'none',
      animation: 'fadeOut 1s ease 2s forwards',
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>
      </svg>
      Drag to compare
      <style>{`@keyframes fadeOut{to{opacity:0}}`}</style>
    </div>
  )
}