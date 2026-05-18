'use client'

import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'Make it fully responsive',
  'Add dark mode support',
  'Add hover animations',
  'Make the button rounded',
  'Add a loading skeleton',
  'Improve accessibility',
  'Add form validation',
  'Make the navbar sticky',
]

function Message({ msg }) {
  const isUser      = msg.role === 'user'
  const isStreaming = msg.status === 'streaming'
  const isError     = msg.status === 'error'
  const isDone      = msg.status === 'done'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '8px',
      alignItems: 'flex-start',
      animation: 'slideUp 0.2s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser
          ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
          : 'var(--bg-hover)',
        border: '1px solid var(--border-subtle)',
      }}>
        {isUser ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '82%',
        padding: '8px 11px',
        borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        background: isUser
          ? 'rgba(124,106,255,0.12)'
          : isError
          ? 'rgba(248,113,113,0.08)'
          : 'var(--bg-card)',
        border: isUser
          ? '1px solid rgba(124,106,255,0.25)'
          : isError
          ? '1px solid rgba(248,113,113,0.2)'
          : '1px solid var(--border-subtle)',
        position: 'relative',
      }}>
        {isStreaming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Animated dots */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-primary)' }}>
              Refining…
            </span>
            <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}`}</style>
          </div>
        ) : isDone && !isUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
              Applied to editor
            </span>
          </div>
        ) : (
          <p style={{
            fontFamily: isUser ? 'var(--font-body)' : 'var(--font-mono)',
            fontSize: '12px',
            color: isError ? 'var(--error)' : 'var(--text-primary)',
            lineHeight: '1.5',
            margin: 0,
          }}>
            {isError && '⚠ '}{msg.text}
          </p>
        )}
      </div>
    </div>
  )
}

export default function RefinementChat({
  isVisible,
  isRefining,
  messages,
  onRefine,
  onClear,
  onCancel,
}) {
  const [input, setInput]         = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isRefining) return
    onRefine(trimmed)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestion = (text) => {
    setInput(text)
    inputRef.current?.focus()
  }

  if (!isVisible) return null

  return (
    <div style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      maxHeight: isExpanded ? '320px' : '44px',
      transition: 'max-height 0.3s cubic-bezier(0.23,1,0.32,1)',
      overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', flexShrink: 0,
        borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
        cursor: 'pointer',
        height: '44px',
      }}
        onClick={() => setIsExpanded(p => !p)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Refine
          </span>
          {messages.length > 0 && (
            <span style={{
              padding: '1px 6px', borderRadius: '99px',
              background: 'rgba(124,106,255,0.1)',
              border: '1px solid rgba(124,106,255,0.2)',
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              color: 'var(--accent-primary)', fontWeight: 700,
            }}>
              {Math.floor(messages.length / 2)} edit{messages.length !== 2 ? 's' : ''}
            </span>
          )}
          {isRefining && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-primary)' }}>
              · refining…
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {messages.length > 0 && !isRefining && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              style={{ padding:'2px 8px', borderRadius:'6px', border:'1px solid var(--border-subtle)', background:'transparent', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'9px', cursor:'pointer', transition:'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--error)'; e.currentTarget.style.borderColor='rgba(248,113,113,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border-subtle)' }}
            >
              Clear
            </button>
          )}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
        {messages.length === 0 ? (
          /* Suggestion chips */
          <div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', marginBottom:'8px' }}>
              Try asking:
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  style={{
                    padding:'4px 9px', borderRadius:'99px',
                    border:'1px solid var(--border-subtle)',
                    background:'var(--bg-card)',
                    color:'var(--text-secondary)',
                    fontFamily:'var(--font-body)', fontSize:'11px',
                    cursor:'pointer', transition:'all 0.15s ease',
                    whiteSpace:'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(124,106,255,0.4)'; e.currentTarget.style.color='var(--accent-primary)'; e.currentTarget.style.background='rgba(124,106,255,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='var(--bg-card)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => <Message key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: '8px 12px 10px',
        borderTop: '1px solid var(--border-subtle)',
        flexShrink: 0,
        display: 'flex',
        gap: '7px',
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "make the button rounded" or "add dark mode"'
            disabled={isRefining}
            rows={1}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: input.trim()
                ? '1px solid rgba(124,106,255,0.4)'
                : '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '12.5px',
              lineHeight: '1.4',
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              opacity: isRefining ? 0.5 : 1,
              minHeight: '36px',
              maxHeight: '80px',
              overflowY: 'auto',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,106,255,0.5)'}
            onBlur={e => e.target.style.borderColor = input.trim() ? 'rgba(124,106,255,0.4)' : 'var(--border-subtle)'}
          />
        </div>

        {/* Send / Cancel button */}
        {isRefining ? (
          <button
            onClick={onCancel}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              border: '1px solid rgba(248,113,113,0.3)',
              background: 'rgba(248,113,113,0.08)',
              color: 'var(--error)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Cancel refinement"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              border: 'none',
              background: input.trim()
                ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                : 'var(--bg-hover)',
              color: input.trim() ? '#fff' : 'var(--text-muted)',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: input.trim() ? '0 2px 12px rgba(124,106,255,0.35)' : 'none',
            }}
            title="Send (Enter)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}