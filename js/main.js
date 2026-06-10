/* ============================================================
   Claude Fable 5 LP — interactions (Cyberpunk)
   ============================================================ */
"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- デジタルレイン（マトリクス風背景） ---------- */
(function initRain() {
  const canvas = document.getElementById("rain-canvas");
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");

  const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/\\=+*";
  const FONT_SIZE = 14;
  let columns, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / FONT_SIZE);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  }

  let last = 0;
  function step(now) {
    requestAnimationFrame(step);
    if (now - last < 50) return; // ~20fps で十分
    last = now;

    ctx.fillStyle = "rgba(4, 4, 10, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FONT_SIZE + "px monospace";

    for (let i = 0; i < columns; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;

      // 先頭文字は明るく、まれにマゼンタを混ぜる
      ctx.fillStyle = Math.random() < 0.02 ? "#ff2bd6" : "rgba(0, 240, 255, 0.75)";
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(step);
})();

/* ---------- カーソルグロー ---------- */
(function initCursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || prefersReducedMotion) return;
  let x = 0, y = 0, gx = 0, gy = 0;
  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
  });
  (function follow() {
    gx += (x - gx) * 0.08;
    gy += (y - gy) * 0.08;
    glow.style.left = gx + "px";
    glow.style.top = gy + "px";
    requestAnimationFrame(follow);
  })();
})();

/* ---------- ナビのスクロール状態 ---------- */
(function initNav() {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- ヒーロータイトルのグリッチ ---------- */
(function initGlitch() {
  const el = document.querySelector(".glitch");
  if (!el || prefersReducedMotion) return;
  (function burst() {
    el.classList.add("is-glitching");
    setTimeout(() => el.classList.remove("is-glitching"), 320);
    setTimeout(burst, 1800 + Math.random() * 3200);
  })();
})();

/* ---------- タイプライター ---------- */
(function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  const lines = [
    'claude "5,000万行のコードベースをリファクタリングして"',
    "数百万トークンにわたるタスクでも、集中力を維持します。",
    "100回のプロンプト分の処理を、ワンショットで。",
    "スクリーンショットから、ソースコードを再構築。",
  ];

  if (prefersReducedMotion) {
    el.textContent = lines[0];
    return;
  }

  let lineIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const line = lines[lineIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = line.slice(0, charIdx);
      if (charIdx === line.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 45 + Math.random() * 50);
    } else {
      charIdx -= 3;
      el.textContent = line.slice(0, Math.max(0, charIdx));
      if (charIdx <= 0) {
        deleting = false;
        charIdx = 0;
        lineIdx = (lineIdx + 1) % lines.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 18);
    }
  }
  tick();
})();

/* ---------- スクロール連動の出現・カウンター・バー ---------- */
(function initReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  const animateCounter = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    (function update(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(update);
    })(start);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const delay = prefersReducedMotion ? 0 : Number(el.dataset.delay || 0);

        setTimeout(() => {
          el.classList.add("is-visible");
          el.querySelectorAll(".counter").forEach(animateCounter);
          el.querySelectorAll(".bench__bar").forEach((bar) => {
            bar.style.width = bar.dataset.width + "%";
          });
        }, delay);

        observer.unobserve(el);
      }
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

/* ---------- カードの 3D チルト ---------- */
(function initTilt() {
  if (prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 5}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
})();
