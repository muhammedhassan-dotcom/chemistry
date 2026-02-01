// ===== body.js =====

// جلب العناصر من ملف منفصل
import { elements } from "./elements-data.js";

// =====================
// إعداد Canvas
// =====================
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
const header = document.querySelector(".hero"); // أو اسم السيكشن اللي فوق الكانفاس
function getHeaderHeight() {
  return header ? header.offsetHeight : 0;
}

// =====================
// تحديث حجم Canvas قبل توليد الكرات لتعمل على الموبايل
// =====================
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

// =====================
// إعداد الفقاعات
// =====================
const MAX_BUBBLES = 60;
const bubbles = [];

function radiusForElement(number) {
  return 18 + Math.sqrt(number) * 1.6;
}

// توليد الفقاعات مع ضبط حجمها للموبايل
for (let i = 0; i < MAX_BUBBLES; i++) {
  const el = elements[Math.floor(Math.random() * elements.length)];
  const z = Math.random();

  // ضبط نصف القطر حسب حجم الشاشة
  let baseRadius = radiusForElement(el.number);
  if (W < 768) { // شاشة موبايل
    baseRadius *= 0.6; // تصغير الكرات للموبايل
  }

  const r = baseRadius;
  const visualR = r * (1 + z * 0.9);

  const topWall = getHeaderHeight();
  const bottomWall = H;

  bubbles.push({
    symbol: el.symbol,
    number: el.number,
    color: el.color,
    x: visualR + Math.random() * (W - visualR * 2),
    y: topWall + visualR + Math.random() * (bottomWall - topWall - visualR * 2),
    z: z,
    r: r,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6
  });
}


// =====================
// حل التصادمات
// =====================
function resolveCollisions() {
  const len = bubbles.length;

  for (let i = 0; i < len; i++) {
    const A = bubbles[i];
    const rA = A.r * (1 + A.z * 0.9); // ← نصف القطر الحقيقي

    for (let j = i + 1; j < len; j++) {
      const B = bubbles[j];
      const rB = B.r * (1 + B.z * 0.9);

      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const minDist = rA + rB; // ← تصادم عند السطح الخارجي

      if (dist < minDist) {
        const overlap = (minDist - dist) * 0.5;
        const nx = dx / dist;
        const ny = dy / dist;

        A.x -= nx * overlap;
        A.y -= ny * overlap;
        B.x += nx * overlap;
        B.y += ny * overlap;
      }
    }
  }
}

// =====================
// تفاعل الماوس + اللمس للموبايل
// =====================
const mouse = { x: null, y: null };

// تفاعل الماوس
window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

// تفاعل اللمس (Touch)
window.addEventListener("touchstart", e => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
});

window.addEventListener("touchmove", e => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
  e.preventDefault(); // لمنع تمرير الصفحة أثناء اللمس
}, { passive: false });

window.addEventListener("touchend", () => {
  mouse.x = null;
  mouse.y = null;
});


// =====================
// أدوات مساعدة
// =====================
function hexToRgba(hex, alpha = 1) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// =====================
// رسم فقاعة واحدة
// =====================
function drawBubble(b) {
  const depthScale = 1 + b.z * 0.9;
  const r = b.r * depthScale;

  // الجسم الكروي
  const g = ctx.createRadialGradient(
    b.x - r * 0.35,
    b.y - r * 0.35,
    r * 0.05,
    b.x,
    b.y,
    r
  );

  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.12, "rgba(255,255,255,0.6)");
  g.addColorStop(0.26, hexToRgba(b.color, 0.85));
  g.addColorStop(0.56, hexToRgba(b.color, 0.45));
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.beginPath();
  ctx.fillStyle = g;
  ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
  ctx.fill();

  // لمعة سينمائية
  const spec = ctx.createRadialGradient(
    b.x - r * 0.45,
    b.y - r * 0.45,
    0,
    b.x - r * 0.45,
    b.y - r * 0.45,
    r * 0.28
  );

  spec.addColorStop(0, "rgba(255,255,255,0.9)");
  spec.addColorStop(1, "rgba(255,255,255,0)");

  ctx.beginPath();
  ctx.fillStyle = spec;
  ctx.arc(
    b.x - r * 0.35,
    b.y - r * 0.35,
    r * 0.28,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // النص
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.font = `${Math.max(10, r * 0.62)}px Poppins, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.symbol, b.x, b.y);
}

// =====================
// حلقة الأنيميشن
// =====================
let last = performance.now();

function loop(now) {
  const dt = Math.min(40, now - last) / 1000;
  last = now;

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, W, H);

  const px = mouse.x ? (mouse.x - W / 2) * 0.02 : 0;
  const py = mouse.y ? (mouse.y - H / 2) * 0.02 : 0;

  for (const b of bubbles) {
    if (mouse.x !== null) {
      const dx = b.x - mouse.x;
      const dy = b.y - mouse.y;
      const dist = Math.hypot(dx, dy) + 0.001;
      const maxR = 140;

      if (dist < maxR) {
        const push = (1 - dist / maxR) * 60 * dt;
        b.vx += (dx / dist) * push;
        b.vy += (dy / dist) * push;
      }
    }

    b.vx *= 0.995;
    b.vy *= 0.995;

    b.x += b.vx + px * (b.z * 0.08);
    b.y += b.vy + py * (b.z * 0.08);

    const visualR = b.r * (1 + b.z * 0.9);

    if (b.x < visualR) { b.x = visualR; b.vx *= -0.6; }
    if (b.x > W - visualR) { b.x = W - visualR; b.vx *= -0.6; }
    if (b.y < visualR + 40) { b.y = visualR + 40; b.vy *= -0.6; }
    if (b.y > H - visualR) { b.y = H - visualR; b.vy *= -0.6; }
  }

  resolveCollisions();
  bubbles.sort((a, b) => a.z - b.z);

  for (const b of bubbles) drawBubble(b);

  requestAnimationFrame(loop);
}

loop(performance.now());
