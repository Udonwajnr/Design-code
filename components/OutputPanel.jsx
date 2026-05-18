'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import TabSwitcher from './TabSwitcher'
import ActionToolbar from './ActionToolbar'
import ViewportToolbar from './ViewportToolbar'

const FileTabs = dynamic(() => import('./FileTabs'), {
  ssr: false,
  loading: () => <MonacoLoadingFallback />,
})

const LivePreview = dynamic(() => import('./LivePreview'), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>Loading preview…</span>
    </div>
  ),
})

const CompareSlider = dynamic(() => import('./CompareSlider'), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>Loading comparison…</span>
    </div>
  ),
})

// ─── Shared sub-components ────────────────────────────────────────────────────

function MonacoLoadingFallback() {
  return (
    <div style={{ flex: 1, background: '#0d0d18', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {['42%','68%','31%','57%','75%','44%','62%','38%','80%','50%'].map((w, i) => (
        <div key={i} style={{
          height: '14px', borderRadius: '3px', width: w,
          marginLeft: i % 3 === 0 ? '0' : i % 3 === 1 ? '20px' : '40px',
          background: 'linear-gradient(90deg, #13131f 0%, #1e1e30 50%, #13131f 100%)',
          backgroundSize: '200% 100%',
          animation: `shimmer 1.5s ease-in-out ${i * 0.06}s infinite`,
        }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

function StreamingBar({ tokenCount, onCancel }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 16px', background:'rgba(124,106,255,0.05)', borderBottom:'1px solid rgba(124,106,255,0.12)', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
        <div style={{ position:'relative', width:'8px', height:'8px' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent-primary)', animation:'ping 1s cubic-bezier(0,0,.2,1) infinite', opacity:0.5 }} />
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent-primary)' }} />
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--accent-primary)', fontWeight:600 }}>Generating…</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-muted)' }}>{tokenCount.toLocaleString()} chars</span>
      </div>
      <button onClick={onCancel}
        style={{ padding:'3px 10px', borderRadius:'6px', border:'1px solid var(--border-default)', background:'var(--bg-card)', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:'10px', cursor:'pointer', transition:'all 0.15s ease' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--error)';e.currentTarget.style.color='var(--error)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-default)';e.currentTarget.style.color='var(--text-secondary)'}}>
        ✕ Cancel
      </button>
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
    </div>
  )
}

function DoneBar({ onReset }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 16px', background:'rgba(52,211,153,0.04)', borderBottom:'1px solid rgba(52,211,153,0.12)', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--success)' }} />
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--success)', fontWeight:600 }}>Complete — code is editable</span>
      </div>
      <button onClick={onReset}
        style={{ padding:'3px 10px', borderRadius:'6px', border:'1px solid var(--border-subtle)', background:'var(--bg-card)', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'10px', cursor:'pointer', transition:'all 0.15s ease' }}
        onMouseEnter={e=>{e.currentTarget.style.color='var(--text-secondary)';e.currentTarget.style.borderColor='var(--border-active)'}}
        onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.borderColor='var(--border-subtle)'}}>
        ↺ New
      </button>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'40px' }}>
      <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'15px', color:'var(--text-primary)', marginBottom:'8px' }}>Generation failed</p>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--error)', background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)', padding:'10px 16px', borderRadius:'10px', maxWidth:'340px', lineHeight:'1.7' }}>{message}</p>
      </div>
      <button onClick={onRetry}
        style={{ padding:'9px 22px', borderRadius:'9px', border:'1px solid var(--border-default)', background:'var(--bg-card)', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.15s ease' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent-primary)';e.currentTarget.style.color='var(--accent-primary)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-default)';e.currentTarget.style.color='var(--text-secondary)'}}>
        ↺ Try again
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', padding:'40px' }}>
      <div style={{ width:'100%', maxWidth:'360px', borderRadius:'12px', border:'1px solid var(--border-subtle)', background:'var(--bg-card)', overflow:'hidden', opacity:0.4 }}>
        <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border-subtle)', display:'flex', gap:'5px' }}>
          {['#f87171','#fbbf24','#34d399'].map(c=><div key={c} style={{ width:'9px', height:'9px', borderRadius:'50%', background:c }} />)}
        </div>
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'9px' }}>
          {[['#c084fc','28%'],['#38bdf8','62%'],['#c8d3f5','44%'],['#7c6aff','58%'],['#c8d3f5','33%'],['#34d399','52%']].map(([color,width],i)=>(
            <div key={i} style={{ height:'10px', borderRadius:'3px', background:color, width, opacity:0.2 }} />
          ))}
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'15px', color:'var(--text-secondary)', marginBottom:'6px' }}>Your code appears here</p>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', lineHeight:'1.8' }}>
          Upload a design → configure → Generate<br/>Code streams in live, token by token
        </p>
      </div>
    </div>
  )
}

// ─── Main OutputPanel ─────────────────────────────────────────────────────────
export default function OutputPanel({
  status, code, files, error, tokenCount,
  framework, styling,
  onCancel, onReset, onRetry,
  activeTab, onTabChange, onCodeChange, onFileChange,
  uploadedImage,
}) {
  const hasCode   = !!code && (status === 'streaming' || status === 'done')
  const isDone    = status === 'done'
  const hasImage  = !!uploadedImage

  const [viewport,   setViewport]   = useState('desktop')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDark,     setIsDark]     = useState(true)

  useEffect(() => {
    const update = () => setIsDark(!document.documentElement.classList.contains('light'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleRefresh = () => setRefreshKey(k => k + 1)

  // files object with fallback for streaming (before JSON is parsed)
  const displayFiles = files || { component: code, styles: null, test: '', index: '' }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Top header: tabs + action toolbar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--border-subtle)', background:'var(--bg-panel)', flexShrink:0, gap:'12px' }}>
        <TabSwitcher activeTab={activeTab} onChange={onTabChange} hasCode={isDone} hasImage={hasImage} />
        <ActionToolbar code={code} framework={framework} styling={styling} tokenCount={tokenCount} status={status} />
      </div>

      {/* ── Status bars ── */}
      {status === 'streaming' && <StreamingBar tokenCount={tokenCount} onCancel={onCancel} />}
      {status === 'done'      && <DoneBar onReset={onReset} />}

      {/* ── Viewport toolbar ── */}
      {activeTab === 'preview' && isDone && (
        <ViewportToolbar viewport={viewport} onChange={setViewport} onRefresh={handleRefresh} code={code} isDark={isDark} />
      )}

      {/* ── Content area ── */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0 }}>
        {status === 'idle'     && <EmptyState />}
        {status === 'starting' && <MonacoLoadingFallback />}
        {status === 'error'    && <ErrorState message={error} onRetry={onRetry} />}

        {/* CODE TAB — FileTabs with component/styles/test/index */}
        {hasCode && (
          <div style={{ flex:1, overflow:'hidden', display: activeTab === 'code' ? 'flex' : 'none', flexDirection:'column' }}>
            <FileTabs
              files={displayFiles}
              framework={framework}
              styling={styling}
              isStreaming={status === 'streaming'}
              onFileChange={onFileChange}
            />
          </div>
        )}

        {/* PREVIEW TAB */}
        {hasCode && isDone && activeTab === 'preview' && (
          <LivePreview key={refreshKey} code={code} viewport={viewport} isDark={isDark} />
        )}

        {/* COMPARE TAB */}
        {hasCode && isDone && activeTab === 'compare' && (
          <CompareSlider key="compare" code={code} image={uploadedImage} isDark={isDark} />
        )}
      </div>
    </div>
  )
}