'use client'

import { useState } from 'react'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImagePreview({ image, onRemove, onReplace }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [imgDimensions, setImgDimensions] = useState(null)

  const handleImageLoad = (e) => {
    setImgDimensions({
      w: e.target.naturalWidth,
      h: e.target.naturalHeight,
    })
  }

  return (
    <>
      {/* Preview card */}
      <div style={{
        width: '100%',
        borderRadius: '16px',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        overflow: 'hidden',
        animation: 'slideUp 0.35s ease',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {image.name}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {/* Zoom */}
            <button
              onClick={() => setIsZoomed(true)}
              title="View full size"
              style={iconBtnStyle}
              onMouseEnter={e => Object.assign(e.currentTarget.style, iconBtnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, iconBtnStyle)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
            </button>

            {/* Replace */}
            <button
              onClick={onReplace}
              title="Replace image"
              style={iconBtnStyle}
              onMouseEnter={e => Object.assign(e.currentTarget.style, iconBtnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, iconBtnStyle)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
              </svg>
            </button>

            {/* Remove */}
            <button
              onClick={onRemove}
              title="Remove image"
              style={{ ...iconBtnStyle, color: 'var(--error)' }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { ...iconBtnHover, color: 'var(--error)', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { ...iconBtnStyle, color: 'var(--error)' })}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Image display */}
        <div style={{
          position: 'relative',
          background: 'repeating-conic-gradient(var(--bg-hover) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px',
          maxHeight: '260px',
          overflow: 'hidden',
          cursor: 'zoom-in',
        }} onClick={() => setIsZoomed(true)}>
          <img
            src={image.url}
            alt="Uploaded design"
            onLoad={handleImageLoad}
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '260px',
              objectFit: 'contain',
              display: 'block',
              padding: '12px',
            }}
          />
          {/* Hover overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(124,106,255,0.0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(8,8,16,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,106,255,0)'}
          >
            <div style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(8,8,16,0.7)',
              border: '1px solid var(--border-default)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
            }}
              className="zoom-hint"
            >
              Click to zoom
            </div>
          </div>
        </div>

        {/* Metadata strip */}
        <div style={{
          display: 'flex',
          gap: '0',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {[
            { label: 'Size', value: formatBytes(image.size) },
            { label: 'Type', value: image.type.split('/')[1].toUpperCase() },
            { label: 'Dimensions', value: imgDimensions ? `${imgDimensions.w} × ${imgDimensions.h}` : '—' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              flex: 1,
              padding: '8px 12px',
              borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom lightbox */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(8,8,16,0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            animation: 'fadeIn 0.2s ease',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setIsZoomed(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >✕</button>
          <img
            src={image.url}
            alt="Uploaded design full size"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}
    </>
  )
}

// Shared button styles
const iconBtnStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '7px',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
}

const iconBtnHover = {
  ...iconBtnStyle,
  background: 'var(--bg-hover)',
  borderColor: 'var(--border-active)',
  color: 'var(--text-primary)',
}