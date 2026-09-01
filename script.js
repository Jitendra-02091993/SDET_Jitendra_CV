/* ===================================================================
   script.js — Portfolio interactions & animations
   =================================================================== */

// ─── Footer year ───────────────────────────────────────────────────
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Sticky header scroll state ────────────────────────────────────
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── Cursor glow ───────────────────────────────────────────────────
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  }, { passive: true });
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

// ─── Scroll reveal ─────────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Safety net — reveal everything after 4 s in case observer is slow
  setTimeout(() => {
    revealEls.forEach((el) => el.classList.add('visible'));
  }, 4000);
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// ─── Mobile navigation toggle ──────────────────────────────────────
const navToggle  = document.querySelector('#navToggle');
const primaryNav = document.querySelector('#primary-nav');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('is-active', isOpen);
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('is-active');
    });
  });
}

// ─── Hero canvas — floating particles ──────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Skip on reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.max(20, Math.floor((canvas.width * canvas.height) / 13000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.6 + 0.4,
        dx:    (Math.random() - 0.5) * 0.38,
        dy:    (Math.random() - 0.5) * 0.38,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(215, 247, 96, ${0.06 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw & move particles
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215, 247, 96, ${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    raf = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(raf);
      resize();
      createParticles();
      draw();
    }, 200);
  });
})();

// ─── Animated counters ─────────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.counted) return;
        entry.target.dataset.counted = 'true';

        const target    = parseFloat(entry.target.dataset.target);
        const suffix    = entry.target.dataset.suffix || '';
        const isFloat   = String(target).includes('.');
        const duration  = 1700;
        const startTime = performance.now();

        function tick(now) {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased    = 1 - Math.pow(1 - progress, 3);
          const value    = eased * target;
          entry.target.textContent =
            (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((c) => counterObserver.observe(c));
})();

// ─── 3-D card tilt ─────────────────────────────────────────────────
(function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return; // skip touch

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left)  / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)   / rect.height - 0.5;
      card.style.transform =
        `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateZ(6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ─── Timeline progress line ────────────────────────────────────────
(function initTimelineLine() {
  const lineInner = document.getElementById('timelineProgress');
  const timeline  = document.querySelector('.timeline');
  if (!lineInner || !timeline) return;

  function updateLine() {
    const rect     = timeline.getBoundingClientRect();
    const winH     = window.innerHeight;
    const progress = Math.max(0, Math.min(1,
      (winH - rect.top) / (rect.height + winH * 0.35)
    ));
    lineInner.style.height = (progress * 100) + '%';
  }

  window.addEventListener('scroll', updateLine, { passive: true });
  updateLine(); // run once on load
})();
