# ZeroGPU Cookbook

Examples, end-to-end tutorials, and small apps built with the [ZeroGPU](https://zerogpu.ai) API.

## Structure

All runnable demos live under **`demos/`**, one folder per demo, with a descriptive name:

```
cookbook/
├── README.md           ← you are here
├── .gitignore          ← ignores .env, node_modules, dist (keeps repo safe)
└── demos/
    ├── summarize-react/        ← React summarization app
    ├── iab-classification-react/ ← React IAB classification app
    ├── batch-requests-node/    ← Node.js parallel batch requests
    ├── quickstart-python/      ← Python one-shot request
    └── ...
```

**Naming:** Use `demos/<name>/` where `<name>` is short and descriptive, e.g. `summarize-react`, `iab-classification-node`.

## Demos

| Demo | Description |
|------|-------------|
| [demos/summarize-react](demos/summarize-react) | React (Vite): summarize text with `zlm-v1-summary-cloud`. API key and project ID in the UI. |
| [demos/iab-classification-react](demos/iab-classification-react) | React (Vite): classify content into IAB categories with `zlm-v1-iab-classify-cloud`. |
| [demos/batch-requests-node](demos/batch-requests-node) | Node.js: send multiple summarization requests in parallel. Env vars for credentials. |
| [demos/quickstart-python](demos/quickstart-python) | Python: one request to the API, print response and usage. Env vars for credentials. |

## Adding a new demo

1. Create a folder under `demos/` with a clear name (e.g. `demos/my-feature-react/`).
2. Add a `README.md` in that folder with setup and run instructions.
3. **Do not commit** `.env`, API keys, or secrets. Use `.env.example` for templates. The repo `.gitignore` already ignores `.env` and `node_modules`.
4. Update this README’s **Demos** table with a link and one-line description.

## Security

- Never commit `.env` or any file containing API keys or secrets.
- `.env.example` (templates only, no real values) is fine to commit.
- Demos that take credentials in the UI (e.g. for local try-it) are for demo use only; production apps should call ZeroGPU from a backend.
