"""Minimal example: send user input with a secure system prompt.

Replace the fake `complete()` function with your provider SDK
(OpenAI, Anthropic, Azure, local model, etc.).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from secure_llm import build_chat_messages  # noqa: E402

PRODUCT_POLICY = """
You are the in-app assistant for Acme Notes.
You may summarize, draft, and answer questions about the current user's notes.
You may not access other users' notes, change account settings, or send email.
""".strip()


def complete(messages: list[dict[str, str]]) -> str:
    """Stand-in for an LLM API call. Swap this for your provider."""
    return json.dumps(
        {
            "would_send_to_model": [
                {"role": m["role"], "chars": len(m["content"])} for m in messages
            ],
            "system_prompt_preview": messages[0]["content"][:180] + "...",
        },
        indent=2,
    )


def main() -> None:
    user_text = (
        sys.argv[1]
        if len(sys.argv) > 1
        else "Summarize my latest note in two sentences."
    )
    messages = build_chat_messages(user_text, developer_notes=PRODUCT_POLICY)
    print(complete(messages))


if __name__ == "__main__":
    main()
