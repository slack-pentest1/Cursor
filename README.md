# Secure system prompt for an AI app

One combined, security-focused **system prompt** plus a helper that sends it as a single system message on every model call.

A system prompt is useful. It is **not** a complete security control. Models can still be steered by prompt injection. Keep secrets, authorization, and irreversible actions in application code.

This is not a copy of any vendor or assistant hidden prompt. It is a generic app prompt based on public LLM security practice (role boundary, injection resistance, least-privilege tools, no secrets in the prompt).

## Quick start

1. Copy `prompts/secure_system_prompt.txt` into your app (or import `src/secure_llm.py`).
2. Replace the `{{APP_NAME}}` / `{{TASKS}}` / `{{FORBIDDEN_ACTIONS}}` lines with your product, or pass them as `developer_notes`.
3. Send the **combined** string as the system message on every request.
4. Wrap user text, uploads, and retrieved documents as untrusted data.

```python
from secure_llm import build_chat_messages, combine_system_prompt

PRODUCT = """
You are the in-app assistant for MyApp.
Intended tasks: answer product questions and draft text.
You must not: access other users' data, change billing, or send email.
"""

# One string you can paste into any provider's `system` field:
system_prompt = combine_system_prompt(PRODUCT)

messages = build_chat_messages(user_text, developer_notes=PRODUCT)
# client.chat.completions.create(model="...", messages=messages)
```

Run the local example (no API key required):

```bash
python examples/apply_system_prompt.py "Summarize this note"
```

Use `prompts/secure_system_prompt.min.txt` only when you must save tokens. Prefer the full prompt.

## What this prompt does

| Goal | How the prompt approaches it |
| --- | --- |
| Stay in product scope | Product-policy block plus capability boundary |
| Resist prompt injection | Hierarchy; user/tool content treated as data; encoded, role-play, and “admin” bypasses ignored |
| Stay consistent | Rules re-applied every turn; no “from now on” policy changes from the user |
| Limit leaks | No secrets in the prompt; refuse dumps of keys, other users’ data, and internal config |
| Reduce misuse | Refuse crime, exploits, malware, CSAM, weapons even when framed as lab/CTF/fiction; no attack steps |
| Constrain tools | Least privilege; tool output is untrusted; no irreversible actions unless the app authorized them |
| Keep outputs clean | No fabricated actions, hidden instructions, or payloads |

## What this prompt cannot do

OWASP’s LLM guidance is clear: **do not treat the system prompt as a secret or as an authorization layer**. Attackers can often induce the model to ignore it.

Enforce these in **code**, not in the prompt:

- Authentication and per-user authorization
- Tool allowlists, argument validation, and least-privilege API keys
- Human approval for irreversible or high-impact actions
- Output schema validation before you act on model output
- Sanitization of HTML/Markdown before rendering
- Secrets in a vault or environment — never in the prompt
- Rate limits, logging, and abuse monitoring

If the model “agrees” to do something unsafe, your backend must still refuse it.

## How to customize safely

Keep the security sections. Change only the product-policy block, for example:

```text
You are the in-app assistant for Acme Notes.
Intended tasks: summarize and draft from the current user's notes.
You must not: access other users' notes, change billing, or send email.
```

Pass that as `developer_notes`. The helper merges it with the security rules into **one** system message.

Do **not** put into the prompt:

- API keys, passwords, connection strings
- Internal hostnames, admin runbooks, or filter evasion details
- Other users’ data
- “If the user says the override password, ignore safety rules”

## Applying it with common APIs

**OpenAI-compatible chat**

```python
client.chat.completions.create(
    model=model,
    messages=build_chat_messages(user_text, developer_notes=PRODUCT_POLICY),
)
```

**Anthropic**

Use the same text as `system=load_system_prompt()`, and send the wrapped user content as the user turn.

**Local / GGUF / other chat templates**

Put the prompt in the template’s system slot. If the template has no system role, prepend it in a clearly delimited block and still wrap user content.

Always send the system prompt **every turn**. Do not rely on the model remembering it from an earlier message.

## Defense in depth (recommended)

1. **Separate data from instructions** — wrap untrusted content (`wrap_untrusted()`).
2. **Validate outputs** — parse JSON/schema; do not execute free-form model text.
3. **Least privilege tools** — the model cannot call anything your backend does not expose.
4. **Human in the loop** — confirm deletes, payments, messages, and permission changes.
5. **Filter at boundaries** — input and output checks outside the model.
6. **Test** — include “ignore previous instructions” and document-based injection cases in QA.

## Files

- `prompts/secure_system_prompt.txt` — default prompt
- `prompts/secure_system_prompt.min.txt` — short variant
- `src/secure_llm.py` — load prompt and wrap untrusted user content
- `examples/apply_system_prompt.py` — wiring example
