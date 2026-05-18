import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function buildRefinePrompt({ instruction, framework, styling }) {
  const frameworkMap = {
    react:  'React (functional components with hooks)',
    nextjs: 'Next.js 14 with App Router',
    vue:    'Vue 3 with Composition API',
  }
  const stylingMap = {
    tailwind:   'Tailwind CSS utility classes',
    cssmodules: 'CSS Modules',
    styled:     'Styled Components',
  }

  return `You are an expert frontend developer refining an existing component.

The user has an existing component built with:
- Framework: ${frameworkMap[framework] || framework}
- Styling: ${stylingMap[styling] || styling}

The user's refinement request: "${instruction}"

RULES:
- Apply ONLY the requested change — do not rewrite unrelated parts
- Keep the same framework and styling system
- Keep all existing functionality intact
- If the original design image is provided, use it as reference to stay true to the design
- Return the COMPLETE updated component code — not just the changed section
- No explanations, no markdown fences, no preamble
- Start directly with imports or component definition
- Include this comment at top: // Refined by design.code — ${instruction.slice(0, 40)}`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { currentCode, imageBase64, imageType, instruction, framework, styling } = body

    if (!currentCode) {
      return new Response(JSON.stringify({ error: 'No current code provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }
    if (!instruction?.trim()) {
      return new Response(JSON.stringify({ error: 'No instruction provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = buildRefinePrompt({ instruction, framework, styling })

    // Build message content — include image if available for design reference
    const userContent = []

    if (imageBase64) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageType || 'image/png',
          data: imageBase64,
        },
      })
    }

    userContent.push({
      type: 'text',
      text: `Here is the current component code:\n\n\`\`\`\n${currentCode}\n\`\`\`\n\nRefinement request: ${instruction}\n\nReturn the complete updated component.`,
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const anthropicStream = await client.messages.stream({
            model: 'claude-sonnet-4-5',
            max_tokens: 8192,
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }],
          })

          for await (const event of anthropicStream) {
            if (event.type === 'message_start') {
              controller.enqueue(encoder.encode(JSON.stringify({ type: 'start' }) + '\n'))
            }
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(JSON.stringify({ type: 'delta', text: event.delta.text }) + '\n'))
            }
            if (event.type === 'message_stop') {
              controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'))
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: err.message }) + '\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}