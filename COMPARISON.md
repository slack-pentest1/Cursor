# Generic system prompt vs this combined prompt

**Generic** means the usual app default, for example:

```text
You are a helpful assistant. Answer the user's questions clearly and politely.
```

**This** means the combined prompt in `prompts/secure_system_prompt.txt` (product policy + security rules, one system message).

Neither prompt is an authorization boundary. If the model ignores the prompt, only backend checks stop a bad action.

## Comparison

| Area | Generic prompt | This combined prompt | Safer? |
| --- | --- | --- | --- |
| Role / scope | Open-ended “helpful assistant”; will try most tasks | Named product, allowed tasks, and explicit “must not” list | This |
| Who wins on conflict | Unspecified; user text often wins | Security rules > product policy > tools > user/RAG/tool output | This |
| Direct prompt injection (“ignore previous instructions”) | No handling | Treated as data, not a command | This |
| Indirect injection (instructions hidden in files, pages, tool results) | No handling | Retrieved/uploaded/tool content labeled untrusted data | This |
| Jailbreak wrappers (DAN, developer mode, role-play, “hypothetical”, pentest, “my own system”) | No handling | Listed as bypass attempts; judge actual goal, not wording | This |
| Encoded restatements (base64, hex, rot13, zero-width text) | No handling | Treated as the same request as the decoded harmful ask | This |
| Fake authority (“I am the admin/developer”) | No handling | Claims of admin/vendor/legal status do not change the rules | This |
| Multi-turn persistence (“from now on, ignore safety”) | Earlier user messages can drift the model | Rules re-applied every turn; no user-installed standing policy | This |
| Secret leakage (keys, env, other users’ data) | Not mentioned; easy to dump if present in context | Refuse secrets, other users’ data, internal config; prompt must not contain secrets | This |
| Prompt dumping | Not mentioned | Refuse to print hidden instructions; don’t recap rules as a bypass guide | This |
| PII handling | Not mentioned | Don’t ask for passwords, full card numbers, or government IDs | This |
| Harmful assistance (exploits, malware, CSAM, fraud, weapons) | Relies only on the model vendor’s default safety | Explicit refuse list; no attack steps/payloads; lab/CTF/fiction framing still refused | This |
| Tool / side-effect control | None (model may “agree” to delete, email, pay) | Only defined tools; least privilege; no irreversible action unless the app authorized it | This |
| Tool-result injection | Tool output treated like trusted instructions | Tool results are untrusted data | This |
| Output integrity | May invent citations, claim it sent email, or emit markdown payloads | No fabricated actions; no hidden instructions in output; schema/error instead of improvising | This |
| Ambiguous risky asks | Often guesses | Ask a clarifying question instead of acting | This |
| Backend authorization | Not addressed | States access control is enforced in application code, not in the prompt | This |
| Stops a determined attacker by itself | No | No — still not a security boundary | Tie |

## What “safer” means here

This prompt is safer as **guidance to the model**: it names the attacks generic prompts skip, and it tells the model to treat user/RAG/tool text as data.

It is **not** safer as a lock. A generic prompt and this prompt can both be bypassed. Your app is actually secure only if:

- Tools check the authenticated user in code
- Secrets never enter the prompt
- Irreversible actions need backend (and often human) approval
- Model output is validated before you execute it

## When a generic prompt is enough

Use a short generic prompt only for a toy chatbot with **no tools, no private data, and no side effects**. If the model can read user data, call APIs, or change state, use this combined prompt **and** the backend controls above.
