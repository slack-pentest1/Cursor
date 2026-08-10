import { drawConstellation, fitCanvas } from "/constellation.js";

const grid = document.getElementById("grid");
const emptyEl = document.getElementById("empty");
const ledeEl = document.getElementById("galleryLede");

const animated = [];

function makeCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const canvas = document.createElement("canvas");
  const meta = document.createElement("div");
  meta.className = "card-meta";

  const title = document.createElement("h3");
  title.textContent = item.name;

  const by = document.createElement("p");
  const when = new Date((item.createdAt || "").replace(" ", "T") + "Z");
  const whenText = isNaN(when) ? "" : ` · ${when.toLocaleDateString()}`;
  by.textContent = `by ${item.author} · ${item.stars.length} stars${whenText}`;

  meta.append(title, by);
  card.append(canvas, meta);
  grid.append(card);

  // Defer sizing until the canvas is in the DOM and laid out.
  requestAnimationFrame(() => {
    const { ctx, width, height } = fitCanvas(canvas);
    animated.push({ ctx, width, height, item });
  });
}

let phase = 0;
function loop() {
  phase += 0.03;
  for (const a of animated) {
    drawConstellation(a.ctx, a.width, a.height, a.item, { twinklePhase: phase });
  }
  requestAnimationFrame(loop);
}

async function load() {
  try {
    const res = await fetch("/api/constellations");
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      emptyEl.classList.remove("hidden");
      ledeEl.textContent = "Every constellation published by a stargazer, forever.";
      return;
    }
    ledeEl.textContent = `${items.length} constellation${
      items.length === 1 ? "" : "s"
    } charted by stargazers.`;
    items.forEach(makeCard);
    loop();
  } catch (err) {
    ledeEl.textContent = "Could not reach the sky. Is the server running?";
  }
}

load();
