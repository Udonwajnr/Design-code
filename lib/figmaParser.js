/**
 * Figma URL formats we need to handle:
 *
 * Design files:
 *   https://www.figma.com/design/ABC123/My-File?node-id=0-1
 *   https://www.figma.com/file/ABC123/My-File?node-id=0%3A1
 *
 * Prototypes:
 *   https://www.figma.com/proto/ABC123/My-File?node-id=0-1
 *
 * Community:
 *   https://www.figma.com/community/file/ABC123
 *
 * Node IDs come in two formats:
 *   0-1  (dash-separated)
 *   0:1  (colon-separated, sometimes URL-encoded as 0%3A1)
 */

export function parseFigmaURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Please enter a Figma URL' }
  }

  const trimmed = url.trim()

  // Must be a figma.com URL
  if (!trimmed.includes('figma.com')) {
    return { valid: false, error: 'URL must be from figma.com' }
  }

  try {
    const parsed = new URL(trimmed)

    // Extract file key from path: /design/FILEKEY/... or /file/FILEKEY/...
    const pathMatch = parsed.pathname.match(
      /^\/(design|file|proto|board)\/([a-zA-Z0-9]+)/
    )

    if (!pathMatch) {
      return {
        valid: false,
        error: 'Could not find a file key in this URL. Make sure you\'re sharing a specific Figma file.',
      }
    }

    const fileKey = pathMatch[2]

    // Extract node-id from query params
    // Figma uses ?node-id=0-1 or ?node-id=0%3A1 (URL-encoded colon)
    const rawNodeId = parsed.searchParams.get('node-id')

    let nodeId = null
    if (rawNodeId) {
      // Normalise: replace - or %3A or : all to colon format for the API
      // Figma API wants "0:1" format
      nodeId = decodeURIComponent(rawNodeId).replace(/-/g, ':')
    }

    return {
      valid:   true,
      fileKey,
      nodeId,   // null if no node selected — we'll fetch the first page
      url:      trimmed,
    }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validate a Figma personal access token (basic format check)
 * Tokens look like: figd_XXXX... or fig-... (older format)
 */
export function validateFigmaToken(token) {
  if (!token || typeof token !== 'string') return false
  const t = token.trim()
  return t.length > 20  // just check it's not obviously empty/wrong
}

/**
 * Build a human-readable description of what was parsed
 */
export function describeFigmaURL({ fileKey, nodeId }) {
  if (nodeId) return `File ${fileKey} · Node ${nodeId}`
  return `File ${fileKey} · First page`
}