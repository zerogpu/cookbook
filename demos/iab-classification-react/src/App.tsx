import { useState, useEffect } from 'react'

const API_URL = 'https://api.zerogpu.ai/v1/responses'
const DEFAULT_MODEL = 'zlm-v1-iab-classify-cloud'
const STORAGE_KEY_API = 'zerogpu_iab_api_key'
const STORAGE_KEY_PROJECT = 'zerogpu_iab_project_id'

const SAMPLE_TEXT = `The stock market rallied today as tech giants reported strong earnings. Investors are optimistic about the economic recovery and consumer spending. Analysts recommend a diversified portfolio with exposure to renewable energy and healthcare.`

type Usage = { input_tokens?: number; output_tokens?: number; total_tokens?: number }

// IAB classification response shape (from zlm-v1-iab-classify-cloud)
type IABAudienceItem = {
  id?: number
  parent_id?: number
  name: string
  tier1_name?: string
  tier2_name?: string
  tier3_name?: string
  score: number
}
type IABContentItem = {
  code?: string
  id?: number
  parent_id?: number
  parent_code?: string | null
  name: string
  tier?: number
  tier1_name?: string
  tier2_name?: string
  score: number
}
type IABTopic = { name: string; score: number }
type IABUserIntent = { name?: string; category?: string; score?: number }
type IABResult = {
  audience?: IABAudienceItem[]
  content?: Record<string, IABContentItem[]>
  topics?: IABTopic[]
  keywords?: string[]
  user_intent?: IABUserIntent
}

function extractText(data: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }): string {
  for (const msg of data.output ?? []) {
    for (const block of msg.content ?? []) {
      if (block.type === 'output_text' && block.text) return block.text.trim()
    }
  }
  return ''
}

function tryParseIAB(text: string): IABResult | null {
  try {
    const parsed = JSON.parse(text) as IABResult
    if (parsed && (parsed.audience || parsed.content || parsed.topics || parsed.keywords || parsed.user_intent)) {
      return parsed
    }
  } catch {
    // not JSON or wrong shape
  }
  return null
}

function StructuredIAB({ data }: { data: IABResult }) {
  const { audience = [], content = {}, topics = [], keywords = [], user_intent } = data
  const contentEntries = Object.entries(content)

  return (
    <div className="iab-structured">
      {audience.length > 0 && (
        <section className="iab-section">
          <h3>Audience</h3>
          <ul className="iab-list">
            {audience.map((item, i) => (
              <li key={i}>
                <span className="iab-name">{item.name}</span>
                {item.tier2_name && <span className="iab-meta"> → {item.tier2_name}</span>}
                {item.tier3_name && <span className="iab-meta"> → {item.tier3_name}</span>}
                <span className="iab-score">{(item.score * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contentEntries.length > 0 && contentEntries.map(([key, items]) => (
        <section key={key} className="iab-section">
          <h3>Content — {key.replace(/_/g, ' ')}</h3>
          <ul className="iab-list">
            {(items || []).map((item, i) => (
              <li key={i}>
                <span className="iab-name">{item.name}</span>
                {item.code && <span className="iab-meta"> ({item.code})</span>}
                <span className="iab-score">{(item.score * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {topics.length > 0 && (
        <section className="iab-section">
          <h3>Topics</h3>
          <ul className="iab-list iab-topics">
            {topics.map((t, i) => (
              <li key={i}>
                <span className="iab-name">{t.name}</span>
                <span className="iab-score">{(t.score * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {keywords.length > 0 && (
        <section className="iab-section">
          <h3>Keywords</h3>
          <p className="iab-keywords">{keywords.join(', ')}</p>
        </section>
      )}

      {user_intent && (user_intent.category || user_intent.name) && (
        <section className="iab-section">
          <h3>User intent</h3>
          <p className="iab-intent">
            {user_intent.name && <span>{user_intent.name}</span>}
            {user_intent.category && <span className="iab-meta"> — {user_intent.category}</span>}
            {typeof user_intent.score === 'number' && (
              <span className="iab-score"> ({(user_intent.score * 100).toFixed(0)}%)</span>
            )}
          </p>
        </section>
      )}
    </div>
  )
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
  const [result, setResult] = useState('')
  const [usage, setUsage] = useState<Usage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)

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
    setResult('')
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
      setResult(extractText(data))
      setUsage(data.usage ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>ZeroGPU IAB Classification Demo</h1>
      <p className="subtitle">Classify content into IAB categories with the ZeroGPU API (zlm-v1-iab-classify-cloud).</p>

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
          placeholder="Paste or type content to classify (e.g. article, snippet)..."
          disabled={missingCreds}
        />
        <p className="input-hint">Tip: IAB works best with a paragraph or more; very short text often gets generic categories.</p>
        <button type="submit" disabled={loading || missingCreds}>
          {loading ? 'Classifying…' : 'Classify'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {(result || usage) && (
        <div className="result">
          {result && (() => {
            const parsed = tryParseIAB(result)
            const copyResult = () => {
              const text = parsed
                ? [
                    parsed.audience?.length && `Audience:\n${parsed.audience.map((a) => `  ${a.name} ${(a.score * 100).toFixed(1)}%`).join('\n')}`,
                    Object.entries(parsed.content ?? {}).map(([k, items]) => `Content ${k}:\n${(items || []).map((i) => `  ${i.name} ${(i.score * 100).toFixed(1)}%`).join('\n')}`).join('\n\n'),
                    parsed.topics?.length && `Topics:\n${parsed.topics.map((t) => `  ${t.name} ${(t.score * 100).toFixed(1)}%`).join('\n')}`,
                    parsed.keywords?.length && `Keywords: ${parsed.keywords.join(', ')}`,
                    parsed.user_intent && (parsed.user_intent.category || parsed.user_intent.name) && `User intent: ${[parsed.user_intent.name, parsed.user_intent.category].filter(Boolean).join(' — ')}`,
                  ].filter(Boolean).join('\n\n')
                : result
              void navigator.clipboard.writeText(text).then(() => setCopyFeedback(true), () => {})
              setTimeout(() => setCopyFeedback(false), 2000)
            }
            return (
              <>
                <div className="result-header">
                  <h2>IAB classification</h2>
                  <button type="button" className="btn-copy" onClick={copyResult}>
                    {copyFeedback ? 'Copied' : 'Copy result'}
                  </button>
                </div>
                {parsed ? <StructuredIAB data={parsed} /> : <p className="result-raw">{result}</p>}
              </>
            )
          })()}
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
