'use client'

import { useState, useEffect, useRef } from 'react'
import { parseFigmaURL, validateFigmaToken, describeFigmaURL } from '@/lib/figmaParser'

const TOKEN_STORAGE_KEY = 'designcode_figma_token'

// ─── Steps indicator ──────────────────────────────────────────────────────────
function HowToGetToken() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop:'6px' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:'4px' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--accent-primary)', textDecoration:'underline' }}>
          How to get a Figma token?
        </span>
      </button>

      {open && (
        <div style={{ marginTop:'8px', padding:'10px 12px', borderRadius:'8px', background:'rgba(124,106,255,0.06)', border:'1px solid rgba(124,106,255,0.15)' }}>
          {[
            'Open Figma and click your profile picture',
            'Go to Settings → Security',
            'Click "Generate new token" under Personal access tokens',
            'Give it a name (e.g. "design.code") and set expiry',
            'Copy and paste it here — only needs Read access',
          ].map((step, i) => (
            <div key={i} style={{ display:'flex', gap:'8px', marginBottom: i < 4 ? '6px' : 0 }}>
              <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'rgba(124,106,255,0.15)', border:'1px solid rgba(124,106,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'var(--accent-primary)', fontWeight:700 }}>{i+1}</span>
              </div>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'11px', color:'var(--text-secondary)', lineHeight:'1.5' }}>{step}</span>
            </div>
          ))}
          <a
            href="https://www.figma.com/settings"
            target="_blank"
            rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:'4px', marginTop:'8px', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--accent-primary)' }}
          >
            Open Figma Settings
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Main FigmaInput component ────────────────────────────────────────────────
export default function FigmaInput({ onImageFetched, isDisabled }) {
  const [isExpanded,   setIsExpanded]   = useState(false)
  const [token,        setToken]        = useState('')
  const [showToken,    setShowToken]    = useState(false)
  const [url,          setUrl]          = useState('')
  const [status,       setStatus]       = useState('idle') // idle | loading | success | error
  const [errorMsg,     setErrorMsg]     = useState('')
  const [parsedInfo,   setParsedInfo]   = useState(null)
  const [saveToken,    setSaveToken]    = useState(true)
  const urlInputRef = useRef(null)

  // Load saved token on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (saved) setToken(saved)
    } catch {}
  }, [])

  // Parse URL as user types
  useEffect(() => {
    if (!url.trim()) { setParsedInfo(null); return }
    const result = parseFigmaURL(url)
    setParsedInfo(result)
  }, [url])

  const handleFetch = async () => {
    if (isDisabled || status === 'loading') return

    const tokenTrimmed = token.trim()
    const urlTrimmed   = url.trim()

    if (!validateFigmaToken(tokenTrimmed)) {
      setErrorMsg('Please enter your Figma personal access token')
      setStatus('error')
      return
    }

    const parsed = parseFigmaURL(urlTrimmed)
    if (!parsed.valid) {
      setErrorMsg(parsed.error)
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    // Save token if requested
    if (saveToken) {
      try { localStorage.setItem(TOKEN_STORAGE_KEY, tokenTrimmed) } catch {}
    }

    try {
      const res = await fetch('/api/figma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: parsed.fileKey,
          nodeId:  parsed.nodeId,
          token:   tokenTrimmed,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to fetch from Figma')
        setStatus('error')
        return
      }

      // Convert base64 → Blob → File-like object that matches our image shape
      const byteChars  = atob(data.imageBase64)
      const byteArrays = []
      for (let i = 0; i < byteChars.length; i += 512) {
        const slice  = byteChars.slice(i, i + 512)
        const bytes  = new Uint8Array(slice.length)
        for (let j = 0; j < slice.length; j++) bytes[j] = slice.charCodeAt(j)
        byteArrays.push(bytes)
      }
      const blob = new Blob(byteArrays, { type: 'image/png' })
      const file = new File([blob], `figma-${parsed.fileKey}.png`, { type: 'image/png' })
      const objectURL = URL.createObjectURL(blob)

      setStatus('success')

      // Hand off to parent — same shape as UploadZone's onFileAccepted
      onImageFetched({
        file,
        url:  objectURL,
        name: `figma-${parsed.fileKey}.png`,
        size: blob.size,
        type: 'image/png',
        source: 'figma',
        figmaFileKey: data.figmaFileKey,
        figmaNodeId:  data.nodeId,
      })

      // Collapse after success
      setTimeout(() => {
        setIsExpanded(false)
        setStatus('idle')
        setUrl('')
      }, 1200)

    } catch (err) {
      setErrorMsg(err.message || 'Network error — check your connection')
      setStatus('error')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetch()
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const urlValid  = parsedInfo?.valid
  const canFetch  = validateFigmaToken(token) && urlValid && !isLoading && !isDisabled

  return (
    <div style={{
      borderRadius: '12px',
      border: isExpanded
        ? '1px solid rgba(124,106,255,0.35)'
        : '1px solid var(--border-subtle)',
      background: isExpanded ? 'rgba(124,106,255,0.04)' : 'var(--bg-card)',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>

      {/* ── Header toggle ── */}
      <button
        onClick={() => setIsExpanded(p => !p)}
        style={{
          width: '100%', padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {/* Figma logo */}
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #ff7262, #a259ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="11" height="14" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z" fill="white"/>
              <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z" fill="white" opacity="0.8"/>
              <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z" fill="white" opacity="0.8"/>
              <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z" fill="white" opacity="0.6"/>
              <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <div style={{ textAlign:'left' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', display:'block' }}>
              Import from Figma
            </span>
            {!isExpanded && (
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-muted)' }}>
                Paste a Figma share URL
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          {/* New badge */}
          <span style={{ padding:'1px 6px', borderRadius:'99px', background:'rgba(124,106,255,0.12)', border:'1px solid rgba(124,106,255,0.2)', fontFamily:'var(--font-mono)', fontSize:'8px', fontWeight:700, color:'var(--accent-primary)', letterSpacing:'0.3px' }}>
            NEW
          </span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.25s ease' }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {isExpanded && (
        <div style={{ padding:'0 14px 14px', display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Figma token */}
          <div>
            <label style={labelStyle}>
              Personal Access Token
              <span style={{ color:'var(--error)', marginLeft:'2px' }}>*</span>
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="figd_xxxxxxxxxxxx..."
                style={{
                  ...inputStyle,
                  paddingRight: '36px',
                  borderColor: token && !validateFigmaToken(token) ? 'rgba(248,113,113,0.4)' : undefined,
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,106,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
              <button
                onClick={() => setShowToken(p => !p)}
                style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'2px', display:'flex' }}
              >
                {showToken ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Save token toggle */}
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'6px' }}>
              <button
                onClick={() => setSaveToken(p => !p)}
                style={{
                  width:'28px', height:'16px', borderRadius:'99px',
                  border: 'none',
                  background: saveToken ? 'var(--accent-primary)' : 'var(--bg-hover)',
                  cursor:'pointer', position:'relative', flexShrink:0, transition:'background 0.2s ease',
                  padding:0,
                }}
              >
                <div style={{
                  width:'12px', height:'12px', borderRadius:'50%', background:'white',
                  position:'absolute', top:'2px',
                  left: saveToken ? '14px' : '2px',
                  transition:'left 0.2s ease',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-muted)' }}>
                Remember token in browser
              </span>
            </div>

            <HowToGetToken />
          </div>

          {/* Figma URL */}
          <div>
            <label style={labelStyle}>Figma Frame URL</label>
            <input
              ref={urlInputRef}
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://www.figma.com/design/..."
              style={{
                ...inputStyle,
                borderColor: url && parsedInfo && !parsedInfo.valid
                  ? 'rgba(248,113,113,0.4)'
                  : url && parsedInfo?.valid
                  ? 'rgba(52,211,153,0.4)'
                  : undefined,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,106,255,0.5)'}
              onBlur={e => {
                if (url && parsedInfo?.valid) e.target.style.borderColor = 'rgba(52,211,153,0.4)'
                else if (url && !parsedInfo?.valid) e.target.style.borderColor = 'rgba(248,113,113,0.4)'
                else e.target.style.borderColor = 'var(--border-subtle)'
              }}
            />

            {/* URL parse feedback */}
            {url && parsedInfo && (
              <div style={{ marginTop:'5px', display:'flex', alignItems:'center', gap:'5px' }}>
                {parsedInfo.valid ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--success)' }}>
                      {parsedInfo.nodeId
                        ? `File: ${parsedInfo.fileKey} · Node: ${parsedInfo.nodeId}`
                        : `File: ${parsedInfo.fileKey} · Will use first frame`
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--error)' }}>{parsedInfo.error}</span>
                  </>
                )}
              </div>
            )}

            <p style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-muted)', marginTop:'5px', lineHeight:'1.5' }}>
              In Figma, right-click a frame → Copy link to selection
            </p>
          </div>

          {/* Error message */}
          {status === 'error' && errorMsg && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:'7px', padding:'9px 12px', borderRadius:'8px', background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', animation:'slideUp 0.2s ease' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:'1px' }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'12px', color:'var(--error)', lineHeight:'1.5' }}>{errorMsg}</span>
            </div>
          )}

          {/* Fetch button */}
          <button
            onClick={handleFetch}
            disabled={!canFetch}
            style={{
              width: '100%', padding:'11px',
              borderRadius:'10px', border:'none',
              background: isSuccess
                ? 'rgba(52,211,153,0.15)'
                : canFetch
                ? 'linear-gradient(135deg, #ff7262 0%, #a259ff 100%)'
                : 'var(--bg-hover)',
              color: isSuccess ? 'var(--success)' : canFetch ? '#fff' : 'var(--text-muted)',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:'13px',
              cursor: canFetch ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              transition:'all 0.2s ease',
              boxShadow: canFetch && !isSuccess ? '0 4px 20px rgba(162,89,255,0.35)' : 'none',
            }}
          >
            {isLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.8s linear infinite' }}>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                Fetching from Figma…
              </>
            ) : isSuccess ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                Frame imported!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Fetch Frame
              </>
            )}
          </button>

          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '9px',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
}