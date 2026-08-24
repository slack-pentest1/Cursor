import Database from "better-sqlite3";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Allow overriding the data directory (used by tests and ephemeral runs).
const dataDir = process.env.CONSTELLATE_DATA_DIR
  ? process.env.CONSTELLATE_DATA_DIR
  : join(__dirname, "data");
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, "constellate.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS constellations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'anonymous stargazer',
    stars TEXT NOT NULL,
    edges TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const insertStmt = db.prepare(
  `INSERT INTO constellations (name, author, stars, edges)
   VALUES (@name, @author, @stars, @edges)`
);
const listStmt = db.prepare(
  `SELECT * FROM constellations ORDER BY created_at DESC, id DESC`
);
const getStmt = db.prepare(`SELECT * FROM constellations WHERE id = ?`);
const deleteStmt = db.prepare(`DELETE FROM constellations WHERE id = ?`);
const countStmt = db.prepare(`SELECT COUNT(*) AS n FROM constellations`);

function hydrate(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    author: row.author,
    stars: JSON.parse(row.stars),
    edges: JSON.parse(row.edges),
    createdAt: row.created_at,
  };
}

export function createConstellation({ name, author, stars, edges }) {
  const info = insertStmt.run({
    name,
    author: author || "anonymous stargazer",
    stars: JSON.stringify(stars),
    edges: JSON.stringify(edges),
  });
  return hydrate(getStmt.get(info.lastInsertRowid));
}

export function listConstellations() {
  return listStmt.all().map(hydrate);
}

export function getConstellation(id) {
  return hydrate(getStmt.get(id));
}

export function deleteConstellation(id) {
  return deleteStmt.run(id).changes > 0;
}

export function countConstellations() {
  return countStmt.get().n;
}

export default db;
