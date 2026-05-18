'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'designcode_history'
const MAX_ENTRIES = 20

// Convert a File object → base64 data URL (survives page refresh unlike object URLs)
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (e) {
    // Storage quota exceeded — remove oldest and retry
    try {
      const trimmed = entries.slice(0, Math.floor(entries.length / 2))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {
      // Give up silently
    }
  }
}

export function useHistory() {
  const [entries, setEntries] = useState([])

  // Load on mount
  useEffect(() => {
    setEntries(loadFromStorage())
  }, [])

  // Save a new generation to history
  const saveEntry = useCallback(async ({ image, framework, styling, instructions, code, files }) => {
    try {
      const imageDataURL = image?.file ? await fileToDataURL(image.file) : null

      const entry = {
        id:           crypto.randomUUID(),
        timestamp:    Date.now(),
        imageDataURL,
        imageName:    image?.name || 'unknown',
        framework,
        styling,
        instructions: instructions || '',
        code,
        files:        files || null,
        codePreview:  (files?.component || code)?.slice(0, 120) || '',
      }

      setEntries(prev => {
        // Prepend new entry, cap at MAX_ENTRIES
        const updated = [entry, ...prev].slice(0, MAX_ENTRIES)
        saveToStorage(updated)
        return updated
      })

      return entry.id
    } catch (err) {
      console.warn('Failed to save history entry:', err)
      return null
    }
  }, [])

  // Delete a single entry
  const deleteEntry = useCallback((id) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveToStorage(updated)
      return updated
    })
  }, [])

  // Clear all history
  const clearAll = useCallback(() => {
    setEntries([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { entries, saveEntry, deleteEntry, clearAll }
}