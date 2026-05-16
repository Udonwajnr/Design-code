'use client'

import { useState, useRef, useCallback } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const ACCEPTED_EXTENSIONS = '.png, .jpg, .jpeg, .webp'
const MAX_SIZE_MB = 10

export default function UploadZone({ onFileAccepted }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragInvalid, setIsDragInvalid] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const validate = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type. Use PNG, JPG, or WebP.`
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Max size is ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  const handleFile = useCallback((file) => {
    setError(null)
    const err = validate(file)
    if (err) { setError(err); return }

    const url = URL.createObjectURL(file)
    onFileAccepted({ file, url, name: file.name, size: file.size, type: file.type })
  }, [onFileAccepted])

  const onDragOver = (e) => {
    e.preventDefault()
    const items = Array.from(e.dataTransfer.items)
    const valid = items.some(i => ACCEPTED_TYPES.includes(i.type))
    setIsDragOver(true)
    setIsDragInvalid(!valid)
  }

  const onDragLeave = (e) => {
    // Only fire if leaving the zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
      setIsDragInvalid(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    setIsDragInvalid(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  // Determine border color
  const borderColor = isDragInvalid
    ? 'var(--error)'
    : isDragOver
    ? 'var(--accent-primary)'
    : 'var(--border-default)'

  const bgColor = isDragInvalid
    ? 'rgba(248,113,113,0.04)'
    : isDragOver
    ? 'rgba(124,106,255,0.06)'
    : 'transparent'

  return (
    <div style={{ width: '100%' }}>
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          width: '100%',
          minHeight: '220px',
          borderRadius: '16px',
          border: `2px dashed ${borderColor}`,
          background: bgColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.15s ease',
          transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated corner accents when dragging */}
        {isDragOver && !isDragInvalid && (
          <>
            {[
              { top: 0, left: 0, borderTop: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)', borderRadius: '14px 0 0 0' },
              { top: 0, right: 0, borderTop: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)', borderRadius: '0 14px 0 0' },
              { bottom: 0, left: 0, borderBottom: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)', borderRadius: '0 0 0 14px' },
              { bottom: 0, right: 0, borderBottom: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)', borderRadius: '0 0 14px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', ...s }} />
            ))}
          </>
        )}

        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: isDragInvalid
            ? 'rgba(248,113,113,0.1)'
            : isDragOver
            ? 'rgba(124,106,255,0.12)'
            : 'var(--bg-card)',
          border: `1px solid ${isDragInvalid ? 'rgba(248,113,113,0.2)' : isDragOver ? 'rgba(124,106,255,0.25)' : 'var(--border-default)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}>
          {isDragInvalid ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          ) : isDragOver ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 15V3M7 8l5-5 5 5"/><path d="M20 21H4"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
          )}
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '15px',
            color: isDragInvalid
              ? 'var(--error)'
              : isDragOver
              ? 'var(--accent-primary)'
              : 'var(--text-primary)',
            marginBottom: '5px',
            transition: 'color 0.2s ease',
          }}>
            {isDragInvalid
              ? 'Invalid file type'
              : isDragOver
              ? 'Drop it!'
              : 'Drop your design here'}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}>
            {isDragInvalid
              ? 'Only PNG, JPG, and WebP are supported'
              : isDragOver
              ? 'Release to upload your screenshot'
              : <>or <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>click to browse</span> your files</>
            }
          </p>
        </div>

        {/* Supported formats */}
        {!isDragOver && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['PNG', 'JPG', 'WebP'].map(fmt => (
              <span key={fmt} style={{
                padding: '2px 9px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}>
                {fmt}
              </span>
            ))}
            <span style={{
              padding: '2px 9px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
            }}>
              Max 10MB
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={onInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.2)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--error)' }}>{error}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setError(null) }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', opacity: 0.6, padding: '0 2px' }}
          >✕</button>
        </div>
      )}
    </div>
  )
}