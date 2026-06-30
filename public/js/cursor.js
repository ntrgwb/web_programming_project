const canvas = document.createElement("canvas");
canvas.className = "cursor-canvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d", { alpha: true });

const dot = document.createElement("div");
dot.className = "cursor-dot";
document.body.appendChild(dot);

let dpr = Math.min(window.devicePixelRatio || 1, 1.25);
let w, h;

function resize() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resize();
window.addEventListener("resize", resize);

let mouseX = w / 2;
let mouseY = h / 2;
let dotX = mouseX;
let dotY = mouseY;
let lastX = mouseX;
let lastY = mouseY;

const MAX = 650;
const particles = Array.from({ length: MAX }, () => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0
}));

let index = 0;

function spawn(x, y, amount) {
  for (let i = 0; i < amount; i++) {
    const p = particles[index];
    index = (index + 1) % MAX;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.6 + 0.3;

    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = Math.random() * 0.55 + 0.45;
    p.size = Math.random() * 1.8 + 0.5;
  }
}

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  const dx = mouseX - lastX;
  const dy = mouseY - lastY;
  const dist = Math.hypot(dx, dy);

  if (dist > 3) {
    spawn(mouseX, mouseY, Math.min(18, Math.floor(dist / 3) + 6));
    lastX = mouseX;
    lastY = mouseY;
  }
});

function animate() {
  ctx.clearRect(0, 0, w, h);

  dotX += (mouseX - dotX) * 0.38;
  dotY += (mouseY - dotY) * 0.38;
  dot.style.left = dotX + "px";
  dot.style.top = dotY + "px";

  ctx.globalCompositeOperation = "lighter";

  for (const p of particles) {
    if (p.life <= 0) continue;

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= 0.018;

    ctx.fillStyle = `rgba(0,255,255,${p.life})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  requestAnimationFrame(animate);
}

animate();

document.addEventListener("turbo:load", () => {
  // Kiểm tra xem body mới đã có canvas chưa, nếu chưa thì gắn lại
  if (!document.body.contains(canvas)) {
    document.body.appendChild(canvas);
  }
  
  // Tương tự với dấu chấm con trỏ
  if (!document.body.contains(dot)) {
    document.body.appendChild(dot);
  }
});