# Security notes for this prompt pack

This repository provides a **generic system prompt**. It does not make an LLM application secure by itself.

## Trust model

- User input, uploads, retrieved documents, web pages, and tool results are **untrusted**.
- The model is **not** a reliable policy engine. Assume injection can succeed.
- Application code is the **only** place to enforce permissions and side effects.

## Do not put secrets in prompts

If a key, token, or internal URL is in the system prompt, treat it as leaked. Store credentials in environment variables or a secret manager, and inject them only into backend tool implementations the model cannot read.

## Authorization belongs in the backend

Example of a safe pattern:

1. Model proposes `delete_note(note_id=123)`.
2. Backend checks that `note_id` belongs to the authenticated user.
3. Backend executes or rejects. The model never receives admin credentials.

Example of an unsafe pattern:

- Prompt says “only delete the current user’s notes” and the tool accepts any ID.

## Prompt injection

Direct: the user asks the model to ignore rules or dump the prompt.
Indirect: a document, ticket, or webpage contains hidden instructions.

Mitigations used here:

- One combined prompt (product policy + security rules), with security winning on conflict
- Instruction hierarchy; encoded, role-play, and authority-spoof bypasses treated as data
- Rules re-applied every turn (no user-installed standing policy)
- Wrapping untrusted content in `<untrusted_user_content>`

These reduce accidents. They do not stop a determined attacker. Bound blast radius with tool permissions and output validation.

## Reporting

If you fork this into a product, add your own vulnerability reporting contact. This template repo does not operate a production service.
