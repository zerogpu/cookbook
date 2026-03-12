# ZeroGPU IAB Classification Demo (React)

Classify content into IAB categories using the [ZeroGPU](https://zerogpu.ai) API with the `zlm-v1-iab-classify-cloud` model.

## Prerequisites

- Node.js 18+
- [API key](https://zerogpu.ai) and project ID from the dashboard

## Setup

```bash
cd demos/iab-classification-react
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). Enter your **API Key** and **Project ID** in the form; they’re stored in this browser only (localStorage). Paste content and click **Classify**.

Optional: copy `.env.example` to `.env` to pre-fill credentials. `VITE_ZEROGPU_MODEL` overrides the model (default: `zlm-v1-iab-classify-cloud`).

## Production note

Credentials in the browser are for local/demo use only. For production, call ZeroGPU from a backend.
