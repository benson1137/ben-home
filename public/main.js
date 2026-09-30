(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = () => mqReduce.matches;

  /* ---------- footer year ---------- */
  const y = $('#y');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- typewriter tagline ---------- */
  const typed = $('#typed');
  const phrases = [
    'Completely not good at coding.',
    "Hi, I'm Ben.",
    'Wuhan University of Technology',
    'Wuhan, China',
  ];
  if (typed && !reduce()) {
    let p = 0, i = phrases[0].length, deleting = true, timer = 0;
    const tick = () => {
      const word = phrases[p];
      if (deleting) {
        i--;
        typed.textContent = word.slice(0, i);
        if (i <= 0) { deleting = false; p = (p + 1) % phrases.length; timer = setTimeout(tick, 380); return; }
        timer = setTimeout(tick, 32);
      } else {
        const next = phrases[p];
        i++;
        typed.textContent = next.slice(0, i);
        if (i >= next.length) { deleting = true; timer = setTimeout(tick, 2400); return; }
        timer = setTimeout(tick, 70 + Math.random() * 60);
      }
    };
    timer = setTimeout(tick, 4500);
    document.addEventListener('visibilitychange', () => {
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(tick, 600);
    });
  }

  /* ---------- scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce()) {
    // stagger cards inside the same grid
    $$('.grid').forEach(g => $$('.card.reveal', g).forEach((c, k) => c.style.setProperty('--d', `${k * 90}ms`)));
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('shown'));
  }

  /* ---------- pointer glow + tilt ---------- */
  if (finePointer) {
    const setGlow = (el, e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      return r;
    };
    $$('.glow').forEach(el => el.addEventListener('pointermove', e => setGlow(el, e)));
    $$('.tilt').forEach(el => {
      let raf = 0;
      el.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = setGlow(el, e);
          if (reduce()) return;
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.classList.add('tilting');
          el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`);
          el.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
        });
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- particle constellation background ---------- */
  const canvas = $('#bg');
  if (!canvas || reduce() || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0, H = 0, dpr = 1, particles = [], running = false, rafId = 0, last = 0;
  const pointer = { x: -9999, y: -9999, active: false };
  const LINK = 130;          // px link distance
  let color = '';

  const pickColor = () => { color = mqDark.matches ? '251, 146, 60' : '234, 88, 12'; };
  pickColor();
  mqDark.addEventListener && mqDark.addEventListener('change', pickColor);

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = W < 768;
    const target = Math.min(mobile ? 32 : 80, Math.round((W * H) / (mobile ? 11000 : 16000)));
    while (particles.length < target) particles.push(spawn());
    particles.length = target;
  };
  const spawn = () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
    r: Math.random() * 1.6 + 0.7,
  });

  const frame = t => {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((t - last) / 16.67 || 1, 3);
    last = t;
    ctx.clearRect(0, 0, W, H);

    const n = particles.length;
    for (let a = 0; a < n; a++) {
      const p = particles[a];
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;

      if (pointer.active) {
        const dx = pointer.x - p.x, dy = pointer.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 180 * 180) {
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * 0.35 * dt; p.y += (dy / d) * 0.35 * dt;
          ctx.strokeStyle = `rgba(${color}, ${(1 - d / 180) * 0.45})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }
      for (let b = a + 1; b < n; b++) {
        const q = particles[b];
        const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          ctx.strokeStyle = `rgba(${color}, ${(1 - Math.sqrt(d2) / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${color}, 0.7)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  };

  const start = () => { if (running) return; running = true; last = performance.now(); rafId = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(rafId); };

  let rT = 0;
  window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(resize, 150); }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (finePointer) {
    window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.active = false; });
    window.addEventListener('blur', () => { pointer.active = false; });
  }
  mqReduce.addEventListener && mqReduce.addEventListener('change', e => {
    if (e.matches) { stop(); ctx.clearRect(0, 0, W, H); } else start();
  });

  resize();
  if (!document.hidden) start();
})();
