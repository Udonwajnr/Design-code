'use client'

import { VIEWPORTS } from './LivePreview'

export default function ViewportToolbar({ viewport, onChange, onRefresh, code, isDark }) {
  const handleOpenNewTab = () => {
    if (!code) return

    // Open a blank window first (must be synchronous to avoid popup blockers)
    const win = window.open('', '_blank')
    if (!win) return

    // Dynamically import the HTML builder from LivePreview's module
    // We re-implement a minimal version here so we don't have to import
    // a non-exported function — keeps the bundle clean.
    const prepared = code
      .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*/gm, '')
      .replace(/^import\s+['"][^'"]+['"];?\s*/gm, '')
      .replace(/^export\s+default\s+/gm, 'var __DefaultExport = ')
      .replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')
      .trim()

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>design.code — Preview</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>if(window.tailwind){tailwind.config={darkMode:'class',theme:{extend:{}}}}<\/script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    *,*::before,*::after{box-sizing:border-box;}
    body{margin:0;padding:16px;min-height:100vh;font-family:ui-sans-serif,system-ui,sans-serif;background:${isDark ? '#0d0d18' : '#ffffff'};color:${isDark ? '#eeeef5' : '#111827'};}
    #root{width:100%;}
    #__error{display:none;margin:16px;padding:14px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:10px;font-family:monospace;font-size:12px;color:#ef4444;white-space:pre-wrap;line-height:1.6;}
  </style>
</head>
<body class="${isDark ? 'dark' : ''}">
  <div id="root"></div>
  <div id="__error"></div>
  <script type="text/babel">
    const {useState,useEffect,useRef,useCallback,useMemo,useContext,useReducer,useLayoutEffect,useId,createContext,forwardRef,Fragment} = React;
    ${prepared}
    try {
      const Component = typeof __DefaultExport !== 'undefined' ? __DefaultExport : null;
      if (!Component) throw new Error('No default export found.');
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(Component));
    } catch(err) {
      const box = document.getElementById('__error');
      box.style.display = 'block';
      box.textContent = '⚠ Preview error:\\n' + (err.message || String(err));
    }
  <\/script>
  <script>
    window.addEventListener('error',(e)=>{
      const box=document.getElementById('__error');
      if(box){box.style.display='block';box.textContent='⚠ Runtime error:\\n'+e.message;}
    });
  <\/script>
</body>
</html>`

    // Write directly into the already-open window — no blob URL needed, never expires
    win.document.open()
    win.document.write(html)
    win.document.close()
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 14px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-panel)',
      flexShrink: 0, gap: '10px',
    }}>
      {/* Viewport toggles */}
      <div style={{ display:'flex', gap:'2px', background:'var(--bg-secondary)', padding:'3px', borderRadius:'9px', border:'1px solid var(--border-subtle)' }}>
        {VIEWPORTS.map(vp => {
          const isActive = viewport === vp.id
          return (
            <button
              key={vp.id}
              onClick={() => onChange(vp.id)}
              title={`${vp.label}${vp.frameWidth ? ` (${vp.frameWidth}px)` : ''}`}
              style={{
                display:'flex', alignItems:'center', gap:'5px',
                padding:'4px 11px', borderRadius:'6px', border:'none',
                cursor:'pointer',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
                fontFamily:'var(--font-mono)', fontSize:'11px',
                fontWeight: isActive ? 600 : 400,
                transition:'all 0.15s ease',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                whiteSpace:'nowrap',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='var(--bg-hover)' }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='transparent' }}}
            >
              <span style={{ display:'flex', alignItems:'center', color:'inherit' }}>{vp.icon}</span>
              {vp.label}
            </button>
          )
        })}
      </div>

      {/* Width badge */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)', padding:'3px 8px', borderRadius:'5px', background:'var(--bg-card)', border:'1px solid var(--border-subtle)', flexShrink:0 }}>
        {VIEWPORTS.find(v => v.id === viewport)?.width || '100%'}
      </div>

      {/* Right actions */}
      <div style={{ display:'flex', gap:'6px', marginLeft:'auto' }}>
        {/* Refresh */}
        <button onClick={onRefresh} title="Refresh preview" style={btnBase}
          onMouseEnter={e => Object.assign(e.currentTarget.style, btnHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, btnBase)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16"/><path d="M21 21v-5h-5"/><path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
          </svg>
          Refresh
        </button>

        {/* Open in new tab */}
        <button onClick={handleOpenNewTab} title="Open in new tab" style={btnBase}
          onMouseEnter={e => Object.assign(e.currentTarget.style, btnHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, btnBase)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          New tab
        </button>
      </div>
    </div>
  )
}

const btnBase = {
  display:'flex', alignItems:'center', gap:'5px',
  padding:'5px 10px', borderRadius:'7px',
  border:'1px solid var(--border-subtle)',
  background:'var(--bg-card)',
  color:'var(--text-secondary)',
  fontFamily:'var(--font-mono)', fontSize:'11px',
  cursor:'pointer', transition:'all 0.15s ease', whiteSpace:'nowrap',
}
const btnHover = { ...btnBase, borderColor:'var(--border-active)', color:'var(--text-primary)', background:'var(--bg-hover)' }