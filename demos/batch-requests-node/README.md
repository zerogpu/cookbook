# ZeroGPU Batch Requests Demo (Node.js)

Send multiple ZeroGPU API requests in parallel. Uses the same [Responses API](https://zerogpu.ai) as the other demos; this one runs several summarization calls with `Promise.all`.

## Prerequisites

- Node.js 18+ (uses native `fetch`)
- [API key](https://zerogpu.ai) and project ID

## Setup

Credentials via environment (no `.env` committed):

```bash
cd demos/batch-requests-node
export ZEROGPU_API_KEY=your_api_key
export ZEROGPU_PROJECT_ID=your_project_id
```

Optional: use a [dotenv](https://www.npmjs.com/package/dotenv)-compatible `.env` file (add `dotenv` and load it at the top of `run.js` if you want).

## Run

```bash
npm start
```

Or:

```bash
node run.js
```

The script sends a small batch of sample texts to the summarization model in parallel and prints each result and token usage. Tune concurrency by changing the `SAMPLE_TEXTS` array or wrapping calls in a pool; see the [batch requests cookbook](https://zerogpu.mintlify.app/cookbook/batch-requests) for patterns.

## Optional

- `ZEROGPU_MODEL` — Override model (default: `zlm-v1-summary-cloud`).
