# ZeroGPU Summarization Demo (React)

A minimal React demo that uses the [ZeroGPU](https://zerogpu.ai) API to summarize text with the `zlm-v1-summary-cloud` model.

## Prerequisites

- Node.js 18+
- A ZeroGPU account and [API key](https://zerogpu.ai) (dashboard → API Keys, Project ID from Project Settings)

## Setup

```bash
cd demos/summarize-react
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). Enter your **API Key** and **Project ID** in the form (from the [dashboard](https://zerogpu.ai)); they’re stored in this browser only (localStorage). Paste or edit the sample text and click **Summarize**.

Optional: copy `.env.example` to `.env` to pre-fill the credentials when you open the app. `VITE_ZEROGPU_MODEL` overrides the model (default: `zlm-v1-summary-cloud`).

## Production note

This demo lets you set API credentials in the browser; they are stored in localStorage. That is for local/demo use only. For production, call ZeroGPU from a backend so your API key is never exposed in client code.

## Response

The app shows the summary and token usage. Check [Logs](https://zerogpu.ai) and [Usage](https://zerogpu.ai) in the dashboard to inspect requests and consumption.
