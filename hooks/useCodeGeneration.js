'use client'

import { useState, useRef, useCallback } from 'react'

// Convert a File object to base64 string (strips the data: prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function useCodeGeneration() {
  const [code, setCode]           = useState('')
  const [status, setStatus]       = useState('idle')   // idle | starting | streaming | done | error
  const [error, setError]         = useState(null)
  const [tokenCount, setTokenCount] = useState(0)
  const abortRef = useRef(null)

  const generate = useCallback(async ({ image, framework, styling, instructions }) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Reset state
    setCode('')
    setError(null)
    setTokenCount(0)
    setStatus('starting')

    try {
      // Convert image file to base64
      const imageBase64 = await fileToBase64(image.file)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64,
          imageType: image.type,
          framework,
          styling,
          instructions,
        }),
      })

      if (!response.ok) {
        // Try to parse error JSON
        const errData = await response.json().catch(() => ({ error: 'Server error' }))
        throw new Error(errData.error || `HTTP ${response.status}`)
      }

      // Read the NDJSON stream
      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            if (event.type === 'start') {
              setStatus('streaming')
            }

            if (event.type === 'delta') {
              setCode(prev => prev + event.text)
              setTokenCount(prev => prev + event.text.length)
            }

            if (event.type === 'done') {
              setStatus('done')
            }

            if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (parseErr) {
            // Skip malformed lines
            if (parseErr.message !== 'Unexpected end of JSON input') {
              console.warn('Stream parse error:', parseErr)
            }
          }
        }
      }

      // If we exited the loop without a 'done' event, still mark done
      setStatus(prev => prev === 'streaming' ? 'done' : prev)

    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle')
        setCode('')
      } else {
        setError(err.message || 'Something went wrong')
        setStatus('error')
      }
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setStatus('idle')
    setCode('')
    setError(null)
  }, [])

  const reset = useCallback(() => {
    cancel()
    setTokenCount(0)
  }, [cancel])

  return {
    code,
    status,
    error,
    tokenCount,
    isLoading: status === 'starting' || status === 'streaming',
    isStreaming: status === 'streaming',
    isDone: status === 'done',
    generate,
    cancel,
    reset,
    setCode,   // exposed so Monaco onChange can write edits back into state
  }
}