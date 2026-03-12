#!/usr/bin/env python3
"""
ZeroGPU quickstart demo (Python)

One request to the Responses API. Set ZEROGPU_API_KEY and ZEROGPU_PROJECT_ID
in the environment (or a .env file with python-dotenv).
"""

import os
import sys

try:
    import requests
except ImportError:
    print("Install requests: pip install requests", file=sys.stderr)
    sys.exit(1)

API_URL = "https://api.zerogpu.ai/v1/responses"
MODEL = os.environ.get("ZEROGPU_MODEL", "zlm-v1-summary-cloud")

SAMPLE_INPUT = "ZeroGPU provides nano language models and distributed inference. Get an API key, send a request, get a response."


def main():
    api_key = os.environ.get("ZEROGPU_API_KEY", "").strip()
    project_id = os.environ.get("ZEROGPU_PROJECT_ID", "").strip()
    if not api_key or not project_id:
        print("Set ZEROGPU_API_KEY and ZEROGPU_PROJECT_ID in the environment.", file=sys.stderr)
        sys.exit(1)

    headers = {
        "content-type": "application/json",
        "x-api-key": api_key,
        "x-project-id": project_id,
    }
    payload = {
        "model": MODEL,
        "input": [{"role": "user", "content": SAMPLE_INPUT}],
        "text": {"format": {"type": "text"}},
    }

    print(f"Calling ZeroGPU ({MODEL})...")
    r = requests.post(API_URL, headers=headers, json=payload, timeout=60)
    data = r.json()

    if r.status_code != 200:
        msg = data.get("error", {}).get("message", r.text) or r.text
        print(f"Error {r.status_code}: {msg}", file=sys.stderr)
        sys.exit(1)

    # Extract assistant text
    for msg in data.get("output") or []:
        for block in msg.get("content") or []:
            if block.get("type") == "output_text" and block.get("text"):
                print("\n--- Response ---")
                print(block["text"].strip())
                break
    usage = data.get("usage") or {}
    print(f"\nUsage: input={usage.get('input_tokens')} output={usage.get('output_tokens')} total={usage.get('total_tokens')}")


if __name__ == "__main__":
    main()
