'use client'

import { useRef, useEffect, useState } from 'react'
import Editor, { loader } from '@monaco-editor/react'

// Configure Monaco to load from CDN (no webpack config needed)
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
})

// Register a custom dark theme that matches our design system
const defineTheme = (monaco) => {
  monaco.editor.defineTheme('designcode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '',                  foreground: 'c8d3f5' },
      { token: 'comment',           foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword',           foreground: 'c084fc', fontStyle: 'bold' },
      { token: 'string',            foreground: '86efac' },
      { token: 'number',            foreground: '38bdf8' },
      { token: 'type',              foreground: '7dd3fc' },
      { token: 'tag',               foreground: 'f87171' },
      { token: 'attribute.name',    foreground: 'fb923c' },
      { token: 'attribute.value',   foreground: '86efac' },
      { token: 'delimiter.bracket', foreground: 'fbbf24' },
      { token: 'identifier',        foreground: 'c8d3f5' },
    ],
    colors: {
      'editor.background':              '#0d0d18',
      'editor.foreground':              '#c8d3f5',
      'editor.lineHighlightBackground': '#13131f',
      'editor.selectionBackground':     '#7c6aff33',
      'editor.inactiveSelectionBackground': '#7c6aff1a',
      'editorLineNumber.foreground':    '#3d3d6b',
      'editorLineNumber.activeForeground': '#7c6aff',
      'editorCursor.foreground':        '#7c6aff',
      'editor.findMatchBackground':     '#7c6aff44',
      'editorWidget.background':        '#0f0f1a',
      'editorWidget.border':            '#1e1e30',
      'editorSuggestWidget.background': '#0f0f1a',
      'editorSuggestWidget.border':     '#1e1e30',
      'editorSuggestWidget.selectedBackground': '#1a1a28',
      'scrollbarSlider.background':     '#25253899',
      'scrollbarSlider.hoverBackground':'#3d3d6b99',
      'scrollbarSlider.activeBackground':'#7c6aff99',
      'minimap.background':             '#0d0d18',
      'editorGutter.background':        '#0d0d18',
    },
  })

  monaco.editor.defineTheme('designcode-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '',        foreground: '12121e' },
      { token: 'comment', foreground: '9898b8', fontStyle: 'italic' },
      { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
      { token: 'string',  foreground: '16a34a' },
      { token: 'number',  foreground: '0369a1' },
      { token: 'type',    foreground: '0284c7' },
      { token: 'tag',     foreground: 'dc2626' },
    ],
    colors: {
      'editor.background':              '#f9f9fd',
      'editor.lineHighlightBackground': '#ededf8',
      'editorLineNumber.foreground':    '#c0c0d8',
      'editorLineNumber.activeForeground': '#7c3aed',
      'editorCursor.foreground':        '#7c3aed',
    },
  })
}

export default function MonacoEditor({
  code = '',
  isStreaming = false,
  onChange,
  language = 'javascript',
}) {
  const editorRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('designcode-dark')

  // Sync theme with document class changes
  useEffect(() => {
    const update = () => {
      const isLight = document.documentElement.classList.contains('light')
      setCurrentTheme(isLight ? 'designcode-light' : 'designcode-dark')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleMount = (editor, monaco) => {
    editorRef.current = editor
    defineTheme(monaco)
    monaco.editor.setTheme(currentTheme)
    setIsReady(true)

    // Disable some distracting features while streaming
    editor.updateOptions({
      readOnly: isStreaming,
      renderValidationDecorations: 'off',
    })
  }

  // Toggle read-only as streaming state changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isStreaming })
    }
  }, [isStreaming])

  // Apply correct theme when it changes
  useEffect(() => {
    if (isReady && editorRef.current) {
      const monaco = window.monaco
      if (monaco) monaco.editor.setTheme(currentTheme)
    }
  }, [currentTheme, isReady])

  // Scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && editorRef.current) {
      const lineCount = editorRef.current.getModel()?.getLineCount() || 0
      editorRef.current.revealLine(lineCount)
    }
  }, [code, isStreaming])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Editor
        height="100%"
        language={language}
        value={code}
        theme={currentTheme}
        onChange={onChange}
        onMount={handleMount}
        loading={<MonacoLoader />}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          letterSpacing: 0.3,
          minimap: { enabled: true, scale: 1, renderCharacters: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          formatOnPaste: false,
          formatOnType: false,
          autoIndent: 'full',
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'off',
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          padding: { top: 16, bottom: 16 },
          contextmenu: true,
          quickSuggestions: false,
          parameterHints: { enabled: false },
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: 'off',
          wordBasedSuggestions: 'off',
        }}
      />

      {/* Read-only overlay badge while streaming */}
      {isStreaming && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '20px',
          padding: '3px 9px',
          borderRadius: '6px',
          background: 'rgba(13,13,24,0.85)',
          border: '1px solid var(--border-default)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--text-muted)',
          letterSpacing: '0.5px',
          backdropFilter: 'blur(6px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          READ ONLY · STREAMING
        </div>
      )}
    </div>
  )
}

// Loading state while Monaco JS bundle loads
function MonacoLoader() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d18',
      padding: '20px',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: 0.5 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #7c6aff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4a4a6a' }}>
          Loading editor…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      {['40%','65%','30%','55%','70%','45%','60%'].map((w, i) => (
        <div key={i} style={{
          height: '13px', borderRadius: '3px', width: w,
          marginLeft: i % 3 === 0 ? '0' : i % 3 === 1 ? '20px' : '36px',
          background: 'linear-gradient(90deg, #13131f 0%, #1e1e30 50%, #13131f 100%)',
          backgroundSize: '200% 100%',
          animation: `shimmer 1.5s ease-in-out ${i * 0.08}s infinite`,
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}