import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createConstellation,
  listConstellations,
  getConstellation,
  deleteConstellation,
  countConstellations,
} from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "256kb" }));

const PORT = process.env.PORT || 3000;
const MAX_STARS = 200;

function validatePayload(body) {
  if (typeof body !== "object" || body === null) return "Body must be an object.";
  const { name, stars, edges } = body;
  if (typeof name !== "string" || name.trim().length === 0)
    return "A constellation name is required.";
  if (name.length > 60) return "Name must be 60 characters or fewer.";
  if (!Array.isArray(stars) || stars.length < 2)
    return "A constellation needs at least 2 stars.";
  if (stars.length > MAX_STARS) return `Too many stars (max ${MAX_STARS}).`;
  for (const s of stars) {
    if (
      typeof s !== "object" ||
      s === null ||
      typeof s.x !== "number" ||
      typeof s.y !== "number" ||
      s.x < 0 ||
      s.x > 1 ||
      s.y < 0 ||
      s.y > 1
    ) {
      return "Each star needs normalized x/y coordinates between 0 and 1.";
    }
  }
  if (!Array.isArray(edges)) return "Edges must be an array.";
  for (const e of edges) {
    if (
      !Array.isArray(e) ||
      e.length !== 2 ||
      !Number.isInteger(e[0]) ||
      !Number.isInteger(e[1]) ||
      e[0] < 0 ||
      e[1] < 0 ||
      e[0] >= stars.length ||
      e[1] >= stars.length
    ) {
      return "Each edge must reference two valid star indices.";
    }
  }
  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", constellations: countConstellations() });
});

app.get("/api/constellations", (_req, res) => {
  res.json(listConstellations());
});

app.get("/api/constellations/:id", (req, res) => {
  const item = getConstellation(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Constellation not found." });
  res.json(item);
});

app.post("/api/constellations", (req, res) => {
  const error = validatePayload(req.body);
  if (error) return res.status(400).json({ error });
  const created = createConstellation({
    name: req.body.name.trim(),
    author:
      typeof req.body.author === "string" && req.body.author.trim().length > 0
        ? req.body.author.trim().slice(0, 40)
        : undefined,
    stars: req.body.stars,
    edges: req.body.edges,
  });
  res.status(201).json(created);
});

app.delete("/api/constellations/:id", (req, res) => {
  const removed = deleteConstellation(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: "Constellation not found." });
  res.status(204).end();
});

app.use(express.static(join(__dirname, "public")));

// Only start listening when run directly (keeps the module importable in tests).
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`Constellate orbiting at http://localhost:${PORT}`);
  });
}

export default app;
