'use client'

import { useState, useCallback, useRef } from 'react'

// Convert data URL (stored in history) back to base64 string for API
function dataURLToBase64(dataURL) {
  if (!dataURL) return null
  return dataURL.split(',')[1] || null
}

// Convert File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function useRefinement({ onCodeUpdate, framework, styling }) {
  const [messages,  setMessages]  = useState([])  // { id, role, text, status }
  const [isRefining, setIsRefining] = useState(false)
  const abortRef = useRef(null)

  const refine = useCallback(async ({ instruction, currentCode, image }) => {
    if (!instruction?.trim() || !currentCode || isRefining) return

    const msgId = crypto.randomUUID()

    // Add user message immediately
    setMessages(prev => [...prev, {
      id:     msgId + '_user',
      role:   'user',
      text:   instruction,
      status: 'done',
    }])

    // Add assistant placeholder
    const assistantId = msgId + '_assistant'
    setMessages(prev => [...prev, {
      id:     assistantId,
      role:   'assistant',
      text:   '',
      status: 'streaming',
    }])

    setIsRefining(true)

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Get image as base64 — handle both File objects and data URLs
      let imageBase64 = null
      let imageType   = 'image/png'

      if (image?.file) {
        imageBase64 = await fileToBase64(image.file)
        imageType   = image.type || 'image/png'
      } else if (image?.url?.startsWith('data:')) {
        imageBase64 = dataURLToBase64(image.url)
        imageType   = image.url.split(';')[0].split(':')[1] || 'image/png'
      }

      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          currentCode,
          imageBase64,
          imageType,
          instruction,
          framework,
          styling,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }))
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      // Stream the response
      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''
      let newCode   = ''

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

            if (event.type === 'delta') {
              newCode += event.text
              // Stream into Monaco live
              onCodeUpdate(newCode)
              // Update the assistant message text live
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, text: newCode } : m
              ))
            }

            if (event.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, status: 'done', text: '✓ Applied' } : m
              ))
            }

            if (event.type === 'error') throw new Error(event.message)
          } catch (parseErr) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              console.warn('Refine stream parse error:', parseErr)
            }
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, status: 'error', text: err.message || 'Refinement failed' }
            : m
        ))
      }
    } finally {
      setIsRefining(false)
      abortRef.current = null
    }
  }, [isRefining, onCodeUpdate, framework, styling])

  const clearMessages = useCallback(() => setMessages([]), [])

  const cancelRefine = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsRefining(false)
  }, [])

  return { messages, isRefining, refine, clearMessages, cancelRefine }
}