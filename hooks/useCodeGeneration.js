'use client'

import { useState, useRef, useCallback } from 'react'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Try to extract the JSON object from the raw streamed string.
// Claude sometimes adds leading/trailing whitespace or a stray character.
function parseFilesJSON(raw) {
  try {
    // Find first { and last } to isolate the JSON object
    const start = raw.indexOf('{')
    const end   = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON object found')
    const jsonStr = raw.slice(start, end + 1)
    const parsed  = JSON.parse(jsonStr)
    return {
      component: parsed.component || '',
      styles:    parsed.styles    || null,
      test:      parsed.test      || '',
      index:     parsed.index     || '',
    }
  } catch {
    // Fallback: treat the whole raw string as the component file
    return {
      component: raw,
      styles:    null,
      test:      '',
      index:     "export { default } from './Component';",
    }
  }
}

// Default empty files shape
const EMPTY_FILES = { component: '', styles: null, test: '', index: '' }

export function useCodeGeneration() {
  const [rawCode,    setRawCode]    = useState('')       // full streamed string (for live display)
  const [files,      setFiles]      = useState(EMPTY_FILES) // parsed multi-file object
  const [status,     setStatus]     = useState('idle')   // idle | starting | streaming | done | error
  const [error,      setError]      = useState(null)
  const [tokenCount, setTokenCount] = useState(0)
  const abortRef = useRef(null)

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generate = useCallback(async ({ image, framework, styling, instructions }) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setRawCode('')
    setFiles(EMPTY_FILES)
    setError(null)
    setTokenCount(0)
    setStatus('starting')

    try {
      const imageBase64 = await fileToBase64(image.file)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ imageBase64, imageType: image.type, framework, styling, instructions }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }))
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''
      let fullRaw   = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            if (event.type === 'start')  setStatus('streaming')

            if (event.type === 'delta') {
              fullRaw += event.text
              setRawCode(fullRaw)
              setTokenCount(prev => prev + event.text.length)
            }

            if (event.type === 'done') {
              // Parse the complete streamed JSON into individual files
              const parsed = parseFilesJSON(fullRaw)
              setFiles(parsed)
              setRawCode(parsed.component) // default code view to component file
              setStatus('done')
            }

            if (event.type === 'error') throw new Error(event.message)
          } catch (parseErr) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              console.warn('Stream parse error:', parseErr)
            }
          }
        }
      }

      setStatus(prev => prev === 'streaming' ? 'done' : prev)

    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle')
        setRawCode('')
        setFiles(EMPTY_FILES)
      } else {
        setError(err.message || 'Something went wrong')
        setStatus('error')
      }
    }
  }, [])

  // ── Cancel ────────────────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null }
    setStatus('idle')
    setRawCode('')
    setFiles(EMPTY_FILES)
    setError(null)
  }, [])

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    cancel()
    setTokenCount(0)
  }, [cancel])

  // ── Manual setters (for history restore & Monaco edits) ───────────────────────
  const setCode = useCallback((val) => {
    setRawCode(val)
  }, [])

  const setFileContent = useCallback((key, val) => {
    setFiles(prev => ({ ...prev, [key]: val }))
  }, [])

  const restoreFiles = useCallback((savedFiles) => {
    const parsed = typeof savedFiles === 'string' ? parseFilesJSON(savedFiles) : savedFiles
    setFiles(parsed || EMPTY_FILES)
    setRawCode(parsed?.component || savedFiles || '')
  }, [])

  return {
    // For backwards compat — "code" is always the component file content
    code:      rawCode,
    rawCode,
    files,
    status,
    error,
    tokenCount,
    isLoading:  status === 'starting' || status === 'streaming',
    isStreaming: status === 'streaming',
    isDone:     status === 'done',
    generate,
    cancel,
    reset,
    setCode,
    setStatus,
    setFileContent,
    restoreFiles,
  }
}