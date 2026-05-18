'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

const MonacoEditor = dynamic(() => import('./MonacoEditor'), { ssr: false })

// ─── File tab definitions ─────────────────────────────────────────────────────
function getFileDefs(framework, styling) {
  const isVue     = framework === 'vue'
  const needsCss  = styling === 'cssmodules'
  const compExt   = isVue ? 'vue' : 'jsx'
  const styleExt  = needsCss ? 'module.css' : null

  return [
    {
      key:      'component',
      label:    `Component.${compExt}`,
      language: isVue ? 'html' : 'javascript',
      icon:     isVue ? '💚' : '⚛️',
      always:   true,
    },
    {
      key:      'styles',
      label:    'component.module.css',
      language: 'css',
      icon:     '🎨',
      always:   !!styleExt,   // only show when CSS Modules selected
    },
    {
      key:      'test',
      label:    `Component.test.${compExt}`,
      language: 'javascript',
      icon:     '🧪',
      always:   true,
    },
    {
      key:      'index',
      label:    'index.js',
      language: 'javascript',
      icon:     '📦',
      always:   true,
    },
  ].filter(f => f.always)
}

// ─── Single file tab button ───────────────────────────────────────────────────
function FileTab({ def, isActive, isEmpty, onClick }) {
  return (
    <button
      onClick={onClick}
      title={isEmpty ? `${def.label} — not generated` : def.label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 12px',
        borderRadius: '0',
        border: 'none',
        borderBottom: isActive
          ? '2px solid var(--accent-primary)'
          : '2px solid transparent',
        borderRight: '1px solid var(--border-subtle)',
        background: isActive ? 'var(--bg-secondary)' : 'transparent',
        color: isEmpty
          ? 'var(--text-muted)'
          : isActive
          ? 'var(--text-primary)'
          : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: isActive ? 600 : 400,
        cursor: isEmpty ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        opacity: isEmpty ? 0.45 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!isActive && !isEmpty) e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ fontSize: '12px' }}>{def.icon}</span>
      {def.label}
      {isEmpty && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginLeft: '2px' }}>
          —
        </span>
      )}
    </button>
  )
}

// ─── Per-file action bar (copy + download) ────────────────────────────────────
function FileActions({ def, content, isStreaming }) {
  const canAct = !!content && !isStreaming

  const handleCopy = async () => {
    if (!canAct) return
    try {
      await navigator.clipboard.writeText(content)
      toast.success(`Copied ${def.label}`, {
        style: { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border-default)', fontFamily:'var(--font-mono)', fontSize:'12px', borderRadius:'10px' },
        iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' },
      })
    } catch { toast.error('Copy failed') }
  }

  const handleDownload = () => {
    if (!canAct) return
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = def.label
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${def.label}`, {
      icon: '📥',
      style: { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border-default)', fontFamily:'var(--font-mono)', fontSize:'12px', borderRadius:'10px' },
    })
  }

  return (
    <div style={{ display:'flex', gap:'5px', padding:'4px 10px', borderBottom:'1px solid var(--border-subtle)', background:'var(--bg-panel)', flexShrink:0, alignItems:'center', justifyContent:'space-between' }}>
      {/* File path breadcrumb */}
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
        src/components/<span style={{ color:'var(--text-secondary)' }}>{def.label}</span>
      </span>

      <div style={{ display:'flex', gap:'4px' }}>
        <ActionBtn onClick={handleCopy} disabled={!canAct} title="Copy file" icon={
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        } label="Copy" />
        <ActionBtn onClick={handleDownload} disabled={!canAct} title={`Download ${def.label}`} icon={
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        } label={`↓ ${def.label}`} />
      </div>
    </div>
  )
}

function ActionBtn({ onClick, disabled, title, icon, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display:'flex', alignItems:'center', gap:'4px',
        padding:'3px 8px', borderRadius:'6px',
        border:'1px solid var(--border-subtle)',
        background:'var(--bg-card)',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontFamily:'var(--font-mono)', fontSize:'10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition:'all 0.15s ease',
        whiteSpace:'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor='var(--border-active)'; e.currentTarget.style.color='var(--text-primary)' }}}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-secondary)' }}}
    >
      {icon}{label}
    </button>
  )
}

// ─── Download all as zip ──────────────────────────────────────────────────────
async function downloadAllAsZip(files, fileDefs) {
  try {
    // Dynamically load JSZip from CDN
    const script = document.createElement('script')
    script.src   = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    document.head.appendChild(script)
    await new Promise((res, rej) => { script.onload = res; script.onerror = rej })

    const zip = new window.JSZip()
    const folder = zip.folder('component')

    fileDefs.forEach(def => {
      const content = files[def.key]
      if (content) folder.file(def.label, content)
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'component.zip'
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Downloaded component.zip', {
      icon: '📦',
      style: { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border-default)', fontFamily:'var(--font-mono)', fontSize:'12px', borderRadius:'10px' },
    })
  } catch {
    toast.error('Zip download failed — try copying files individually')
  }
}

// ─── Main FileTabs component ──────────────────────────────────────────────────
export default function FileTabs({ files, framework, styling, isStreaming, onFileChange }) {
  const [activeKey, setActiveKey] = useState('component')

  const fileDefs    = getFileDefs(framework, styling)
  const activeDef   = fileDefs.find(f => f.key === activeKey) || fileDefs[0]
  const activeContent = files[activeKey] || ''
  const hasAnyFile  = fileDefs.some(f => !!files[f.key])

  const handleChange = useCallback((val) => {
    if (onFileChange) onFileChange(activeKey, val)
  }, [activeKey, onFileChange])

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-panel)',
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {fileDefs.map(def => (
          <FileTab
            key={def.key}
            def={def}
            isActive={activeKey === def.key}
            isEmpty={!files[def.key]}
            onClick={() => { if (files[def.key]) setActiveKey(def.key) }}
          />
        ))}

        {/* Download all button — right-aligned */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', padding:'0 10px', borderLeft:'1px solid var(--border-subtle)', flexShrink:0 }}>
          <button
            onClick={() => downloadAllAsZip(files, fileDefs)}
            disabled={!hasAnyFile || isStreaming}
            title="Download all files as .zip"
            style={{
              display:'flex', alignItems:'center', gap:'5px',
              padding:'4px 10px', borderRadius:'7px',
              border:'1px solid var(--border-subtle)',
              background:'var(--bg-card)',
              color: (!hasAnyFile || isStreaming) ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:600,
              cursor: (!hasAnyFile || isStreaming) ? 'not-allowed' : 'pointer',
              opacity: (!hasAnyFile || isStreaming) ? 0.4 : 1,
              transition:'all 0.15s ease',
              whiteSpace:'nowrap',
            }}
            onMouseEnter={e => { if (hasAnyFile && !isStreaming) { e.currentTarget.style.borderColor='var(--accent-primary)'; e.currentTarget.style.color='var(--accent-primary)' }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-secondary)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download all
          </button>
        </div>
      </div>

      {/* ── Per-file breadcrumb + copy/download ── */}
      {activeContent && (
        <FileActions def={activeDef} content={activeContent} isStreaming={isStreaming} />
      )}

      {/* ── Editor ── */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {activeContent ? (
          <MonacoEditor
            key={activeKey}   // remount when switching files so language updates
            code={activeContent}
            isStreaming={isStreaming && activeKey === 'component'}
            onChange={handleChange}
            language={activeDef.language}
          />
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', opacity:0.4 }}>
            <span style={{ fontSize:'24px' }}>{activeDef.icon}</span>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'13px', color:'var(--text-secondary)', marginBottom:'4px' }}>{activeDef.label}</p>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>
                {isStreaming ? 'Generating…' : 'Not yet generated'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}