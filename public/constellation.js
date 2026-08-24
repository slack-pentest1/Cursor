// Shared renderer used by both the studio and the gallery.
// Draws a constellation (normalized 0..1 coordinates) onto a canvas context.

export function drawConstellation(ctx, width, height, { stars, edges }, options = {}) {
  const {
    padding = 24,
    starColor = "#ffffff",
    edgeColor = "rgba(142, 162, 255, 0.55)",
    glow = "#8ea2ff",
    highlightLast = false,
    twinklePhase = 0,
  } = options;

  ctx.clearRect(0, 0, width, height);

  const px = (s) => padding + s.x * (width - padding * 2);
  const py = (s) => padding + s.y * (height - padding * 2);

  // Edges
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = edgeColor;
  ctx.shadowBlur = 8;
  ctx.shadowColor = glow;
  for (const [a, b] of edges) {
    if (!stars[a] || !stars[b]) continue;
    ctx.beginPath();
    ctx.moveTo(px(stars[a]), py(stars[a]));
    ctx.lineTo(px(stars[b]), py(stars[b]));
    ctx.stroke();
  }

  // Stars
  stars.forEach((s, i) => {
    const x = px(s);
    const y = py(s);
    const twinkle = 0.7 + 0.3 * Math.sin(twinklePhase + i * 1.7);
    const r = (highlightLast && i === stars.length - 1 ? 5.5 : 3.6) * twinkle;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, glow);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.shadowBlur = 16;
    ctx.shadowColor = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = starColor;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
}

// Fit a canvas to its CSS box, accounting for device pixel ratio.
export function fitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}
