'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HistoryCard from './HistoryCard'

export default function HistorySidebar({
  entries,
  activeId,
  onRestore,
  onDelete,
  onClearAll,
  isOpen,
  onToggle,
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(e =>
      e.imageName?.toLowerCase().includes(q) ||
      e.framework?.toLowerCase().includes(q) ||
      e.styling?.toLowerCase().includes(q) ||
      e.instructions?.toLowerCase().includes(q) ||
      e.codePreview?.toLowerCase().includes(q)
    )
  }, [entries, search])

  return (
    <>
      {/* ── Toggle tab — always visible on the left edge ── */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Close history' : 'Open history'}
        style={{
          position: 'fixed',
          top: '50%',
          left: isOpen ? '280px' : '0px',
          transform: 'translateY(-50%)',
          zIndex: 40,
          width: '20px',
          height: '56px',
          borderRadius: '0 8px 8px 0',
          border: '1px solid var(--border-default)',
          borderLeft: 'none',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.3s cubic-bezier(0.23,1,0.32,1)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
        >
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* ── Sidebar panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="history-sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed',
              top: '60px', // below header
              left: 0,
              bottom: 0,
              width: '280px',
              zIndex: 35,
              background: 'var(--bg-panel)',
              borderRight: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 14px 10px',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    History
                  </span>
                  {entries.length > 0 && (
                    <span style={{
                      padding: '1px 6px', borderRadius: '99px',
                      background: 'rgba(124,106,255,0.12)',
                      border: '1px solid rgba(124,106,255,0.2)',
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      color: 'var(--accent-primary)', fontWeight: 700,
                    }}>
                      {entries.length}/20
                    </span>
                  )}
                </div>

                {/* Clear all */}
                {entries.length > 0 && (
                  <button
                    onClick={onClearAll}
                    style={{
                      padding: '3px 8px', borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; e.currentTarget.style.color = 'var(--error)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                  style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search history…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px 6px 28px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    outline: 'none', transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,106,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Entry list */}
            <div style={{ flex: 1, overflow: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {entries.length === 0 ? (
                <EmptyState />
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>No results for "{search}"</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, x: -20 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <HistoryCard
                        entry={entry}
                        isActive={entry.id === activeId}
                        onRestore={onRestore}
                        onDelete={onDelete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5' }}>
                Saved locally · Up to 20 generations
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 16px', opacity: 0.5 }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>No history yet</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Your generations will appear here after your first run
        </p>
      </div>
    </div>
  )
}