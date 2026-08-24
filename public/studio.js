import { drawConstellation, fitCanvas } from "/constellation.js";

const canvas = document.getElementById("sky");
const nameInput = document.getElementById("name");
const authorInput = document.getElementById("author");
const starCountEl = document.getElementById("starCount");
const edgeCountEl = document.getElementById("edgeCount");
const statusEl = document.getElementById("status");
const publishBtn = document.getElementById("publish");

let stars = []; // normalized {x, y}
let edges = []; // [i, j]
let render;

function recompute() {
  const { ctx, width, height } = fitCanvas(canvas);
  render = { ctx, width, height };
}

function toNormalized(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (evt.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (evt.clientY - rect.top) / rect.height)),
  };
}

function updateStats() {
  starCountEl.textContent = stars.length;
  edgeCountEl.textContent = edges.length;
  publishBtn.disabled = stars.length < 2;
}

function paint(phase = 0) {
  if (!render) recompute();
  drawConstellation(render.ctx, render.width, render.height, { stars, edges }, {
    highlightLast: true,
    twinklePhase: phase,
  });
}

canvas.addEventListener("click", (evt) => {
  const point = toNormalized(evt);
  stars.push(point);
  if (stars.length > 1) edges.push([stars.length - 2, stars.length - 1]);
  updateStats();
  setStatus("");
});

document.getElementById("undo").addEventListener("click", () => {
  if (stars.length === 0) return;
  stars.pop();
  edges = edges.filter(([a, b]) => a < stars.length && b < stars.length);
  updateStats();
});

document.getElementById("clear").addEventListener("click", () => {
  stars = [];
  edges = [];
  updateStats();
  setStatus("");
});

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

publishBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  if (!name) return setStatus("Give your constellation a name first.", "error");
  if (stars.length < 2)
    return setStatus("Place at least 2 stars to form a constellation.", "error");

  publishBtn.disabled = true;
  setStatus("Publishing to the night sky…");
  try {
    const res = await fetch("/api/constellations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, author: authorInput.value.trim(), stars, edges }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    setStatus(`“${data.name}” is now in the sky! Redirecting to the gallery…`, "success");
    setTimeout(() => (window.location.href = "/gallery.html"), 1100);
  } catch (err) {
    setStatus(err.message, "error");
    publishBtn.disabled = false;
  }
});

window.addEventListener("resize", recompute);

let phase = 0;
function loop() {
  phase += 0.04;
  paint(phase);
  requestAnimationFrame(loop);
}

recompute();
updateStats();
loop();
