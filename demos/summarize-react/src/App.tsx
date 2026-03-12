import { useState, useEffect } from 'react'

const API_URL = 'https://api.zerogpu.ai/v1/responses'
const DEFAULT_MODEL = 'zlm-v1-summary-cloud'
const STORAGE_KEY_API = 'zerogpu_demo_api_key'
const STORAGE_KEY_PROJECT = 'zerogpu_demo_project_id'

const SAMPLE_TEXT = `Machine learning has transformed how we build software. From recommendation systems to natural language processing, models are now central to many products. Training these models traditionally required expensive GPU clusters and deep expertise. ZeroGPU provides a simpler path: nano language models and distributed inference so you can run summarization, classification, and more without managing GPUs. Get your API key from the dashboard, send a request, and get back structured responses. Use the cookbook recipes to integrate quickly.`

type Usage = { input_tokens?: number; output_tokens?: number; total_tokens?: number }

function extractText(data: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }): string {
  for (const msg of data.output ?? []) {
    for (const block of msg.content ?? []) {
      if (block.type === 'output_text' && block.text) return block.text.trim()
    }
  }
  return ''
}

function getInitialApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY_API) ?? import.meta.env.VITE_ZEROGPU_API_KEY ?? ''
  } catch {
    return import.meta.env.VITE_ZEROGPU_API_KEY ?? ''
  }
}

function getInitialProjectId() {
  try {
    return localStorage.getItem(STORAGE_KEY_PROJECT) ?? import.meta.env.VITE_ZEROGPU_PROJECT_ID ?? ''
  } catch {
    return import.meta.env.VITE_ZEROGPU_PROJECT_ID ?? ''
  }
}

export default function App() {
  const [apiKey, setApiKey] = useState(getInitialApiKey)
  const [projectId, setProjectId] = useState(getInitialProjectId)
  const [input, setInput] = useState(SAMPLE_TEXT)
  const [summary, setSummary] = useState('')
  const [usage, setUsage] = useState<Usage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      if (apiKey) localStorage.setItem(STORAGE_KEY_API, apiKey)
      else localStorage.removeItem(STORAGE_KEY_API)
    } catch {}
  }, [apiKey])
  useEffect(() => {
    try {
      if (projectId) localStorage.setItem(STORAGE_KEY_PROJECT, projectId)
      else localStorage.removeItem(STORAGE_KEY_PROJECT)
    } catch {}
  }, [projectId])

  const model = import.meta.env.VITE_ZEROGPU_MODEL ?? DEFAULT_MODEL
  const missingCreds = !apiKey.trim() || !projectId.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (missingCreds) return
    setError('')
    setSummary('')
    setUsage(null)
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey.trim(),
          'x-project-id': projectId.trim(),
        },
        body: JSON.stringify({
          model,
          input: [{ role: 'user', content: input }],
          text: { format: { type: 'text' } },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error?.message ?? data?.message ?? res.statusText
        setError(`API error ${res.status}: ${msg}`)
        return
      }
      setSummary(extractText(data))
      setUsage(data.usage ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>ZeroGPU Summarize Demo</h1>
      <p className="subtitle">Summarize text with the ZeroGPU API (zlm-v1-summary-cloud).</p>

      <div className="credentials">
        <label>
          <span>API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your ZeroGPU API key"
            autoComplete="off"
          />
        </label>
        <label>
          <span>Project ID</span>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Your project ID"
            autoComplete="off"
          />
        </label>
        <p className="credentials-hint">From the <a href="https://zerogpu.ai" target="_blank" rel="noopener noreferrer">dashboard</a>. Stored in this browser only (localStorage).</p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text to summarize..."
          disabled={missingCreds}
        />
        <button type="submit" disabled={loading || missingCreds}>
          {loading ? 'Summarizing…' : 'Summarize'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {(summary || usage) && (
        <div className="result">
          {summary && (
            <>
              <h2>Summary</h2>
              <p>{summary}</p>
            </>
          )}
          {usage && (
            <div className="usage">
              input_tokens: {usage.input_tokens ?? '—'} · output_tokens: {usage.output_tokens ?? '—'} · total:{' '}
              {usage.total_tokens ?? '—'}
            </div>
          )}
        </div>
      )}
    </>
  )
}
