export const runtime = 'edge'

export async function POST(request) {
  try {
    const body = await request.json()
    const { fileKey, nodeId, token } = body

    // ── Validate inputs ───────────────────────────────────────────────────────
    if (!token?.trim()) {
      return json({ error: 'Figma personal access token is required' }, 400)
    }
    if (!fileKey?.trim()) {
      return json({ error: 'Figma file key is required' }, 400)
    }

    const headers = {
      'X-Figma-Token': token.trim(),
      'Content-Type':  'application/json',
    }

    // ── Step 1: If no nodeId, get the first page's first frame ───────────────
    let targetNodeId = nodeId

    if (!targetNodeId) {
      const fileRes = await fetch(
        `https://api.figma.com/v1/files/${fileKey}?depth=2`,
        { headers }
      )

      if (!fileRes.ok) {
        const err = await fileRes.json().catch(() => ({}))
        if (fileRes.status === 403) {
          return json({ error: 'Invalid Figma token or you don\'t have access to this file. Check your personal access token.' }, 403)
        }
        if (fileRes.status === 404) {
          return json({ error: 'Figma file not found. Make sure the file is not private or the link is correct.' }, 404)
        }
        return json({ error: err.message || `Figma API error (${fileRes.status})` }, fileRes.status)
      }

      const fileData = await fileRes.json()

      // Walk the document to find the first frame on the first page
      const firstPage = fileData.document?.children?.[0]
      if (!firstPage) {
        return json({ error: 'This Figma file appears to be empty.' }, 400)
      }

      // Find first FRAME or COMPONENT on the page
      const firstFrame = firstPage.children?.find(
        n => n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
      )

      if (firstFrame) {
        // Convert node ID format: "0:1" → "0:1" (already correct)
        targetNodeId = firstFrame.id
      } else {
        // Fall back to the page itself
        targetNodeId = firstPage.id
      }
    }

    // ── Step 2: Request a PNG render of the node ──────────────────────────────
    // Figma API expects node IDs with colons: "0:1"
    const encodedNodeId = encodeURIComponent(targetNodeId)

    const imageRes = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodedNodeId}&format=png&scale=2`,
      { headers }
    )

    if (!imageRes.ok) {
      const err = await imageRes.json().catch(() => ({}))
      return json({ error: err.message || `Failed to render Figma frame (${imageRes.status})` }, imageRes.status)
    }

    const imageData = await imageRes.json()

    if (imageData.err) {
      return json({ error: `Figma render error: ${imageData.err}` }, 400)
    }

    // Get the S3 URL for our node
    const imageURL = imageData.images?.[targetNodeId]
      || Object.values(imageData.images || {})[0]

    if (!imageURL) {
      return json({
        error: 'Figma returned no image for this node. Try selecting a specific frame in the URL.',
      }, 400)
    }

    // ── Step 3: Fetch the PNG from S3 and convert to base64 ──────────────────
    const pngRes = await fetch(imageURL)

    if (!pngRes.ok) {
      return json({ error: 'Failed to download the rendered image from Figma' }, 500)
    }

    const arrayBuffer = await pngRes.arrayBuffer()
    const base64      = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // ── Step 4: Return base64 image + metadata ────────────────────────────────
    return json({
      success:      true,
      imageBase64:  base64,
      imageType:    'image/png',
      nodeId:       targetNodeId,
      figmaFileKey: fileKey,
    })

  } catch (err) {
    return json({ error: err.message || 'Unexpected server error' }, 500)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}