'use client'

import { useState } from 'react'

const FRAMEWORKS = [
  { id: 'react', label: 'React', icon: '⚛️', desc: 'Functional components + hooks' },
  { id: 'nextjs', label: 'Next.js', icon: '▲', desc: 'App Router ready' },
  { id: 'vue', label: 'Vue 3', icon: '💚', desc: 'Composition API' },
]

const STYLING = [
  { id: 'tailwind', label: 'Tailwind CSS', icon: '🌊' },
  { id: 'cssmodules', label: 'CSS Modules', icon: '🎨' },
  { id: 'styled', label: 'Styled Comp.', icon: '💅' },
]

export default function OptionsPanel({ onGenerate, isLoading, hasImage, initialOptions }) {
  const [framework, setFramework] = useState(initialOptions?.framework || 'react')
  const [styling, setStyling] = useState(initialOptions?.styling || 'tailwind')
  const [instructions, setInstructions] = useState(initialOptions?.instructions || '')
  const [isExpanded, setIsExpanded] = useState(true)

  const handleGenerate = () => {
    if (!hasImage || isLoading) return
    onGenerate({ framework, styling, instructions })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>

      {/* Section toggle header */}
      <button
        onClick={() => setIsExpanded(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Generation Options
          </span>
        </div>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Collapsible options */}
      <div style={{
        display: isExpanded ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '14px',
      }}>

        {/* Framework selector */}
        <div>
          <label style={labelStyle}>Framework</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {FRAMEWORKS.map(fw => (
              <button
                key={fw.id}
                onClick={() => setFramework(fw.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: framework === fw.id
                    ? '1px solid rgba(124,106,255,0.4)'
                    : '1px solid var(--border-subtle)',
                  background: framework === fw.id
                    ? 'rgba(124,106,255,0.08)'
                    : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '15px', flexShrink: 0 }}>{fw.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: framework === fw.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {fw.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {fw.desc}
                  </div>
                </div>
                {/* Radio dot */}
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  border: framework === fw.id ? '4px solid var(--accent-primary)' : '1.5px solid var(--border-active)',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Styling selector */}
        <div>
          <label style={labelStyle}>Styling</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STYLING.map(s => (
              <button
                key={s.id}
                onClick={() => setStyling(s.id)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '9px',
                  border: styling === s.id
                    ? '1px solid rgba(124,106,255,0.4)'
                    : '1px solid var(--border-subtle)',
                  background: styling === s.id
                    ? 'rgba(124,106,255,0.08)'
                    : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: styling === s.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Extra instructions */}
        <div>
          <label style={labelStyle}>
            Extra Instructions
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>(optional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Use dark mode, add hover animations, make it responsive, use TypeScript..."
              maxLength={400}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: instructions.length > 0
                  ? '1px solid rgba(124,106,255,0.3)'
                  : '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '12.5px',
                lineHeight: '1.5',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                minHeight: '72px',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,106,255,0.5)'}
              onBlur={e => e.target.style.borderColor = instructions.length > 0 ? 'rgba(124,106,255,0.3)' : 'var(--border-subtle)'}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: instructions.length > 350 ? 'var(--warning)' : 'var(--text-muted)',
            }}>
              {instructions.length}/400
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

      {/* Generate CTA */}
      <button
        onClick={handleGenerate}
        disabled={!hasImage || isLoading}
        style={{
          width: '100%',
          padding: '13px 20px',
          borderRadius: '12px',
          border: 'none',
          background: !hasImage || isLoading
            ? 'var(--bg-hover)'
            : 'linear-gradient(135deg, var(--accent-primary) 0%, #9b6bff 50%, var(--accent-secondary) 100%)',
          color: !hasImage || isLoading ? 'var(--text-muted)' : '#fff',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.2px',
          cursor: !hasImage || isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          transition: 'all 0.2s ease',
          boxShadow: !hasImage || isLoading ? 'none' : '0 4px 24px rgba(124,106,255,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          if (!hasImage || isLoading) return
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,106,255,0.45)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = !hasImage || isLoading ? 'none' : '0 4px 24px rgba(124,106,255,0.35)'
        }}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Generating code…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Generate Code
            {hasImage && (
              <span style={{
                position: 'absolute',
                right: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                opacity: 0.65,
              }}>
                ⌘↵
              </span>
            )}
          </>
        )}
      </button>

      {/* Hint */}
      {!hasImage && (
        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '-4px',
        }}>
          Upload a design first to enable generation
        </p>
      )}
    </div>
  )
}

// Shared label style
const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '10.5px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  marginBottom: '7px',
}

// Loading spinner
function LoadingSpinner() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}