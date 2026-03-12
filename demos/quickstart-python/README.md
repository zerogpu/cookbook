# ZeroGPU Quickstart Demo (Python)

Minimal Python script: one request to the ZeroGPU [Responses API](https://zerogpu.ai), print the result and token usage.

## Prerequisites

- Python 3.8+
- [API key](https://zerogpu.ai) and project ID

## Setup

```bash
cd demos/quickstart-python
pip install -r requirements.txt
export ZEROGPU_API_KEY=your_api_key
export ZEROGPU_PROJECT_ID=your_project_id
```

## Run

```bash
python run.py
```

Optional: `ZEROGPU_MODEL` overrides the model (default: `zlm-v1-summary-cloud`). For a full quickstart guide, see the [docs](https://zerogpu.mintlify.app/quickstart).
