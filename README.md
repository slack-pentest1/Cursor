# Constellate ✦

Design your own star constellation on a night-sky canvas, name it, and publish it
to a **shared, persistent sky** that everyone can browse.

Built as a small but complete full-stack app to demonstrate a working Cloud Agent
development environment end to end.

![stack](https://img.shields.io/badge/node-%3E%3D20-3c873a) ![express](https://img.shields.io/badge/express-4-black) ![sqlite](https://img.shields.io/badge/better--sqlite3-11-blue)

## What it does

- **Studio** (`/`) — click the sky to place glowing stars. Each new star links to
  the previous one, weaving a constellation. Name it, add an alias, and publish.
- **The Sky** (`/gallery.html`) — a live gallery of every published constellation,
  rendered with twinkling animation and served from the database.

The publish flow is a real end-to-end path: the browser `POST`s normalized star
geometry to the API, it is validated and stored in SQLite, and the gallery reads
it back on the next load — surviving server restarts.

## Tech stack

- **Backend:** Node.js (ES modules) + Express
- **Storage:** SQLite via `better-sqlite3` (WAL mode), file-backed under `data/`
- **Frontend:** vanilla JS + Canvas 2D (no build step)

## Getting started

```bash
npm install
npm start
# open http://localhost:3000
```

Set a custom port with `PORT=4000 npm start`.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check + constellation count |
| `GET` | `/api/constellations` | List all constellations (newest first) |
| `GET` | `/api/constellations/:id` | Fetch a single constellation |
| `POST` | `/api/constellations` | Create one (`{ name, author?, stars[], edges[] }`) |
| `DELETE` | `/api/constellations/:id` | Remove one |

Stars use normalized coordinates (`x`, `y` in `0..1`) so constellations render
responsively at any canvas size. `edges` are index pairs into the `stars` array.

Example:

```bash
curl -s -X POST http://localhost:3000/api/constellations \
  -H 'Content-Type: application/json' \
  -d '{"name":"The Wandering Cursor","author":"you",
       "stars":[{"x":0.2,"y":0.3},{"x":0.5,"y":0.2},{"x":0.7,"y":0.6}],
       "edges":[[0,1],[1,2]]}'
```

## Tests

```bash
npm test
```

Covers validation rules and the create → persist → retrieve round-trip against an
isolated throwaway database.

## Cloud Agent environment

`.cursor/environment.json` installs dependencies with `npm install` and runs the
server via a `server` terminal (`npm start`), exposing port `3000`.
