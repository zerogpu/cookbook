#!/usr/bin/env node
/**
 * ZeroGPU batch requests demo (Node.js)
 *
 * Sends multiple summarization requests in parallel. Set ZEROGPU_API_KEY and
 * ZEROGPU_PROJECT_ID in the environment (or .env with dotenv).
 */

const API_URL = 'https://api.zerogpu.ai/v1/responses'
const MODEL = process.env.ZEROGPU_MODEL || 'zlm-v1-summary-cloud'

const SAMPLE_TEXTS = [
  'Machine learning is transforming software. Models power recommendations, search, and language tools.',
  'ZeroGPU offers nano language models and distributed inference. No GPU management required.',
  'Get your API key from the dashboard. Send a request and receive structured responses.',
]

function getEnv(name) {
  const val = process.env[name]
  if (!val || !val.trim()) {
    console.error(`Error: ${name} is not set. Export it or use a .env file.`)
    process.exit(1)
  }
  return val.trim()
}

function extractText(data) {
  for (const msg of data.output ?? []) {
    for (const block of msg.content ?? []) {
      if (block.type === 'output_text' && block.text) return block.text.trim()
    }
  }
  return ''
}

async function oneRequest(apiKey, projectId, text, index) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'x-project-id': projectId,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [{ role: 'user', content: text }],
      text: { format: { type: 'text' } },
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`[${index}] ${res.status}: ${data?.error?.message ?? data?.message ?? res.statusText}`)
  }
  return { index, text: extractText(data), usage: data.usage }
}

async function main() {
  const apiKey = getEnv('ZEROGPU_API_KEY')
  const projectId = getEnv('ZEROGPU_PROJECT_ID')

  console.log(`Sending ${SAMPLE_TEXTS.length} requests in parallel (model: ${MODEL})...\n`)

  const start = Date.now()
  const results = await Promise.all(
    SAMPLE_TEXTS.map((text, i) => oneRequest(apiKey, projectId, text, i + 1))
  )
  const elapsed = Date.now() - start

  results.forEach(({ index, text, usage }) => {
    console.log(`--- Result ${index} ---`)
    console.log(text || '(no text)')
    if (usage) console.log(`Tokens: in=${usage.input_tokens} out=${usage.output_tokens}`)
    console.log('')
  })

  const totalTokens = results.reduce((sum, r) => sum + (r.usage?.total_tokens ?? 0), 0)
  console.log(`Done in ${elapsed}ms. ${results.length} responses, ${totalTokens} total tokens.`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
