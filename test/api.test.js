import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Use an isolated, throwaway database for the test run.
const dataDir = mkdtempSync(join(tmpdir(), "constellate-test-"));
process.env.CONSTELLATE_DATA_DIR = dataDir;
process.env.PORT = "0";

const { default: app } = await import("../server.js");

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
  rmSync(dataDir, { recursive: true, force: true });
});

test("health endpoint reports ok", async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("rejects a constellation with fewer than two stars", async () => {
  const res = await fetch(`${base}/api/constellations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Too Small", stars: [{ x: 0.1, y: 0.1 }], edges: [] }),
  });
  assert.equal(res.status, 400);
});

test("rejects out-of-range coordinates", async () => {
  const res = await fetch(`${base}/api/constellations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Off Sky",
      stars: [
        { x: 0.1, y: 0.1 },
        { x: 2, y: 0.5 },
      ],
      edges: [[0, 1]],
    }),
  });
  assert.equal(res.status, 400);
});

test("creates, persists, and retrieves a constellation", async () => {
  const payload = {
    name: "The Wandering Cursor",
    author: "test-suite",
    stars: [
      { x: 0.2, y: 0.3 },
      { x: 0.5, y: 0.2 },
      { x: 0.7, y: 0.6 },
    ],
    edges: [
      [0, 1],
      [1, 2],
    ],
  };

  const created = await fetch(`${base}/api/constellations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.ok(item.id > 0);
  assert.equal(item.name, payload.name);
  assert.equal(item.stars.length, 3);

  // It shows up in the list...
  const list = await (await fetch(`${base}/api/constellations`)).json();
  assert.ok(list.some((c) => c.id === item.id));

  // ...and can be fetched individually with intact geometry.
  const fetched = await (await fetch(`${base}/api/constellations/${item.id}`)).json();
  assert.equal(fetched.name, payload.name);
  assert.deepEqual(fetched.edges, payload.edges);
});

test("returns 404 for a missing constellation", async () => {
  const res = await fetch(`${base}/api/constellations/999999`);
  assert.equal(res.status, 404);
});
