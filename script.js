/* ═══════════════════════════════════════════════════════
   KRISHNA KANT SHARMA — PORTFOLIO SCRIPT v5
   Premium animation suite:
   • Count-up preloader
   • Coding canvas background (floating code snippets)
   • Custom magnetic cursor
   • Character hero text reveal
   • Card: centered → right with 3D flip
   • Card fades OUT before About section (NOT overlapping it)
   • Mouse parallax tilt on card + skill cards
   • Education timeline scroll animation
   • Project cards 3D hover tilt
   • Count-up stats
   • Magnetic buttons
   • Scroll-reveal stagger
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const map   = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

  /* ─────────────────────────────────────────────────────
     1. PRELOADER — count-up number
     ───────────────────────────────────────────────────── */
  const preloader  = $('#preloader');
  const preFill    = $('#pre-fill');
  const preCounter = $('#pre-counter');

  document.body.style.overflow = 'hidden';

  const countDuration = 1500;
  const countStart    = Date.now();

  function animateCounter() {
    const elapsed  = Date.now() - countStart;
    const progress = Math.min(elapsed / countDuration, 1);
    const eased    = 1 - (1 - progress) ** 2;
    const count    = Math.round(eased * 100);
    if (preCounter) preCounter.textContent = count + '%';
    if (preFill) preFill.style.width = count + '%';
    if (progress < 1) {
      requestAnimationFrame(animateCounter);
    } else {
      setTimeout(finishPreloader, 250);
    }
  }

  function finishPreloader() {
    preloader && preloader.classList.add('done');
    document.body.style.overflow = '';
    revealHero();
    initCodeCanvas();
    initHeroCode();
    showBottomNav();
    // Let card appear after preloader
    setTimeout(() => {
      const card = $('#floating-card');
      if (card) card.classList.add('show');
    }, 600);
  }

  if (document.readyState === 'complete') setTimeout(() => requestAnimationFrame(animateCounter), 80);
  else window.addEventListener('load', () => setTimeout(() => requestAnimationFrame(animateCounter), 80));

  /* ─────────────────────────────────────────────────────
     2. CODING CANVAS — floating code snippets (developer theme)
     ───────────────────────────────────────────────────── */
  function initCodeCanvas() {
    const canvas = $('#code-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w, h, dpr, columns;
    const fontSize = 16;
    const colGap   = fontSize * 1.35;
    // Code-flavored glyph pool — symbols + keyword fragments read as "source code"
    const glyphs = '01{}[]()<>=>;:&|+-*/._$#@!?λΣ→01ifelreturnconstletawaitsyncfnAImaprducevoid'.split('');
    let drops = [], speeds = [], heads = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(w / colGap);
      drops = []; speeds = []; heads = [];
      for (let x = 0; x < columns; x++) {
        drops[x]  = Math.random() * -h;
        speeds[x] = 0.4 + Math.random() * 0.7;
        heads[x]  = glyphs[(Math.random() * glyphs.length) | 0];
      }
    }
    resize();
    window.addEventListener('resize', resize);
    canvas.classList.add('active');

    function inDarkSection(docY) {
      const within = (el) => el && docY >= el.offsetTop - 40 && docY <= el.offsetTop + el.offsetHeight;
      return within(aboutEl) || within(eduEl);
    }

    function draw() {
      // Trailing fade — slightly stronger so trails are crisp on the light bg
      ctx.fillStyle = 'rgba(233, 233, 231, 0.13)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '600 ' + fontSize + 'px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const x = i * colGap;
        const y = drops[i];
        const docY = window.scrollY + y;
        const dark = inDarkSection(docY);

        // Occasionally mutate the head glyph for a "stream" feel
        if (Math.random() > 0.93) heads[i] = glyphs[(Math.random() * glyphs.length) | 0];

        // Bright leading character
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.95)' : 'rgba(224,123,0,0.85)';
        ctx.fillText(heads[i], x, y);

        // Dim follower one cell up
        ctx.fillStyle = dark ? 'rgba(180,200,255,0.30)' : 'rgba(40,80,170,0.30)';
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], x, y - fontSize);

        drops[i] += speeds[i] * fontSize * 0.4;
        if (y > h && Math.random() > 0.97) {
          drops[i]  = Math.random() * -120;
          speeds[i] = 0.4 + Math.random() * 0.7;
        }
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ─────────────────────────────────────────────────────
     2b. HERO TYPED CODE LINE + token reveal
     ───────────────────────────────────────────────────── */
  function initHeroCode() {
    const hero = $('#hero');
    if (hero) hero.classList.add('aurora-on');

    const target = $('#ht-text');
    if (!target) return;
    const lines = [
      'git commit -m "ship production-grade systems"',
      'npx create-ai-app --rag --llm=claude,gpt-4o',
      'deploy --zero-downtime && scale --to=15k-mau',
      'const hire = () => krishna.join(yourTeam)',
    ];
    let li = 0, ci = 0, deleting = false;
    function tick() {
      const full = lines[li];
      if (!deleting) {
        ci++;
        target.textContent = full.slice(0, ci);
        if (ci === full.length) { deleting = true; return setTimeout(tick, 1900); }
        setTimeout(tick, 42 + Math.random() * 50);
      } else {
        ci--;
        target.textContent = full.slice(0, ci);
        if (ci === 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(tick, 350); }
        setTimeout(tick, 22);
      }
    }
    setTimeout(tick, 1200);
  }

  /* ─────────────────────────────────────────────────────
     3. CUSTOM CURSOR
     ───────────────────────────────────────────────────── */
  const cursorDot  = $('#cursor-dot');
  const cursorRing = $('#cursor-ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
  });
  (function ring() {
    rx = lerp(rx, mx, 0.13); ry = lerp(ry, my, 0.13);
    if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
    requestAnimationFrame(ring);
  })();

  $$('a, button, .skill-card, .floating-card, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovered'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovered'));
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-clicked'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-clicked'));

  /* ─────────────────────────────────────────────────────
     4. LIVE CLOCK
     ───────────────────────────────────────────────────── */
  function updateClock() {
    const el = $('#clock');
    if (!el) return;
    const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    el.textContent = `${String(ist.getHours()).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ─────────────────────────────────────────────────────
     5. HERO TEXT — character split reveal
     ───────────────────────────────────────────────────── */
  function splitChars(el) {
    const text = el.textContent.trim();
    el.innerHTML = text.split('').map((c, i) =>
      `<span class="char" style="transition-delay:${i * 0.04}s">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
  }

  function revealHero() {
    $$('.hero-word').forEach(el => splitChars(el));
    setTimeout(() => {
      $$('.hero-word').forEach((el, i) => setTimeout(() => el.classList.add('revealed'), i * 80));
      $$('.hero-label').forEach((el, i) => setTimeout(() => el.classList.add('revealed'), 180 + i * 60));
      const loc = $('.hero-location');
      if (loc) setTimeout(() => loc.classList.add('revealed'), 350);
      const hex = $('#hex-bg');
      if (hex) hex.classList.add('revealed');
    }, 50);
  }

  /* ─────────────────────────────────────────────────────
     6. BOTTOM NAV
     ───────────────────────────────────────────────────── */
  function showBottomNav() {
    const nav = $('#bottom-nav');
    if (nav) setTimeout(() => nav.classList.add('visible'), 400);
  }

  /* ─────────────────────────────────────────────────────
     7. NAV ACTIVE STATE
     ───────────────────────────────────────────────────── */
  const sections   = $$('section[id]');
  const navLinks   = $$('.bn-link');
  const navHome    = $('.bn-icon');
  const navCta     = $('.bn-cta');
  const navIndicator = $('#bn-indicator');
  let   navCurrentTarget = null;

  function moveIndicator(target) {
    if (!navIndicator) return;
    if (!target) { navIndicator.style.opacity = '0'; navCurrentTarget = null; return; }
    navIndicator.style.opacity = '1';
    navIndicator.style.left   = target.offsetLeft   + 'px';
    navIndicator.style.top    = target.offsetTop    + 'px';
    navIndicator.style.width  = target.offsetWidth  + 'px';
    navIndicator.style.height = target.offsetHeight + 'px';
  }

  function updateNav() {
    // Section in view = the one whose top has passed ~38% down the viewport
    const probe = window.scrollY + window.innerHeight * 0.38;
    let current = sections.length ? sections[0].id : '';
    sections.forEach(sec => { if (probe >= sec.offsetTop) current = sec.id; });
    // Short footer sections sit below the probe line — snap to the last section at page bottom
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
    if (atBottom && sections.length) current = sections[sections.length - 1].id;

    const onContact = current === 'contact';

    let active = null;
    navLinks.forEach(l => {
      const on = l.getAttribute('href') === '#' + current;
      l.classList.toggle('active', on);
      if (on) active = l;
    });
    // Home icon lights up over the hero
    if (navHome) {
      const onHome = current === 'hero';
      navHome.classList.toggle('active', onHome);
      if (onHome) active = navHome;
    }
    // "Contact me" is the active target over the contact/footer section —
    // the single sliding pill moves onto it just like any other item.
    if (navCta) {
      navCta.classList.toggle('active', onContact);
      if (onContact) active = navCta;
    }

    if (active !== navCurrentTarget) {
      navCurrentTarget = active;
      moveIndicator(active);
    }
  }

  /* ─────────────────────────────────────────────────────
     8. FLOATING CARD — scroll-linked position & fade
     
     KEY FIX: Card must completely fade OUT before the
     About section begins (not overlap it).
     ───────────────────────────────────────────────────── */
  const floatCard  = $('#floating-card');
  const fcInner    = $('#fc-inner');
  const heroEl     = $('#hero');
  const anchor     = $('#hero-card-anchor');
  const skillsEl   = $('#skills');
  const aboutEl    = $('#about');
  const eduEl      = $('#education');
  const CARD_W = 280, CARD_H = 380;

  let cardX = 0, cardY = 0;
  let scrollVel = 0, lastScrollY = window.scrollY;
  let tiltX = 0, tiltY = 0;

  function getAnchorCenter() {
    if (!anchor) return { x: window.innerWidth / 2 - CARD_W / 2, y: window.innerHeight / 2 - CARD_H / 2 };
    const r = anchor.getBoundingClientRect();
    // Center the card between the two names' inner edges (names differ in length,
    // so the viewport centre looks off-balance) — fall back to the anchor centre.
    let cx = r.left + r.width / 2;
    const nl = $('#hero-word-left'), nr = $('#hero-word-right');
    if (nl && nr) {
      const lr = nl.getBoundingClientRect().right;
      const rl = nr.getBoundingClientRect().left;
      if (rl - lr > CARD_W) cx = (lr + rl) / 2;
    }
    return { x: cx - CARD_W / 2, y: r.top + r.height / 2 - CARD_H / 2 };
  }
  const skillsAnchor = document.getElementById('skills-card-anchor');
  function getSkillsPos() {
    if (!skillsAnchor) return { x: window.innerWidth * 0.1, y: window.innerHeight * 0.5 };
    const r = skillsAnchor.getBoundingClientRect();
    return { x: r.left + r.width / 2 - CARD_W / 2, y: r.top + r.height / 2 - CARD_H / 2 };
  }

  // Initial card position
  const initPos = getAnchorCenter();
  cardX = initPos.x; cardY = initPos.y;
  if (floatCard) { floatCard.style.left = cardX + 'px'; floatCard.style.top = cardY + 'px'; }

  // Mouse tilt tracking
  document.addEventListener('mousemove', e => {
    if (!floatCard) return;
    const r  = floatCard.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) / (r.width  / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 240) {
      tiltX = lerp(tiltX, -dy * 12, 0.12);
      tiltY = lerp(tiltY,  dx * 12, 0.12);
    } else {
      tiltX = lerp(tiltX, 0, 0.06);
      tiltY = lerp(tiltY, 0, 0.06);
    }
  });

  /* ─────────────────────────────────────────────────────
     9. STACKING CARDS
     ───────────────────────────────────────────────────── */
  const skillCards = $$('.skill-card');

  // Cache each card's rest rotation / horizontal offset / sticky pin point
  skillCards.forEach(card => {
    const cs = getComputedStyle(card);
    card._restRot = parseFloat(cs.getPropertyValue('--rot')) || 0;
    card._restTx  = parseFloat(cs.getPropertyValue('--tx'))  || 0;
    card._pinTop  = parseFloat(cs.top) || 140;
  });

  // Reveal the animated accent bar as each card scrolls into view
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
  }, { threshold: 0.25 });
  skillCards.forEach(c => cardObs.observe(c));

  function applyCardTransform(card, extra) {
    const ty    = card._ty    || 0;
    const tx    = card._tx    != null ? card._tx : 0;
    const rot   = card._rot   != null ? card._rot : card._restRot;
    const scale = card._scale != null ? card._scale : 1;
    card.style.transform =
      `translateY(${ty.toFixed(1)}px) translateX(${tx.toFixed(1)}px) ` +
      (extra || '') +
      `rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
  }

  /* Same-top deck stacking:
     Each card slides up to exactly cover the previous one. We compute a
     CUMULATIVE buried-depth per card (a card under two others is "2 deep"),
     so every card behind the active one steps back in scale, lifts a little,
     tilts to its rest angle and dims — a clean, gap-free layered stack.
     The active (front) card sits straight, centered and bright.  */
  const PIN_TOP = 294;
  function updateStack() {
    const n = skillCards.length;
    if (!n) return;
    const rects = skillCards.map(c => c.getBoundingClientRect());

    // covered[i] = how much the next card overlaps card i (0..1)
    const covered = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) {
      const dist  = rects[i + 1].top - rects[i].top;
      const range = Math.max(rects[i].height * 0.9, 240);
      covered[i]  = clamp(1 - dist / range, 0, 1);
    }
    // cumulative depth, computed bottom-up
    const depth = new Array(n).fill(0);
    for (let i = n - 2; i >= 0; i--) depth[i] = covered[i] * (1 + depth[i + 1]);

    skillCards.forEach((card, i) => {
      const D = depth[i];
      const f = clamp(D, 0, 1);                 // 0 = front/featured, 1 = fully buried
      const cap = Math.min(D, 3);
      card._scale = 1 - cap * 0.045;            // step back per level
      card._ty    = -cap * 11;                  // lift so the card above peeks
      card._rot   = card._restRot * f;          // straighten when featured
      card._tx    = card._restTx  * f;          // center when featured
      const bright = 1 - cap * 0.07;
      card.style.filter = bright < 1 ? `brightness(${bright.toFixed(3)})` : '';

      const pinned = rects[i].top <= PIN_TOP + 12;
      card.classList.toggle('is-featured', pinned && D < 0.25);

      if (!card.classList.contains('is-hovered')) applyCardTransform(card);
    });
  }

  /* ─────────────────────────────────────────────────────
     10. MAIN ANIMATION LOOP
     ───────────────────────────────────────────────────── */
  function loop() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    scrollVel = lerp(scrollVel, (scrollY - lastScrollY) * 0.2, 0.1);
    lastScrollY = scrollY;

    const heroH     = heroEl    ? heroEl.offsetHeight   : vh;
    const skillsBot = skillsEl  ? skillsEl.offsetTop + skillsEl.offsetHeight : heroH * 4;
    // Card must FULLY DISAPPEAR before About starts
    const aboutTop  = aboutEl   ? aboutEl.offsetTop     : skillsBot;

    const heroProgress = clamp(scrollY / heroH, 0, 1);
    const center = getAnchorCenter();
    const right  = getSkillsPos();

    // Position interpolation
    const tX = lerp(center.x, right.x, heroProgress);
    const tY = lerp(center.y, right.y, heroProgress);
    cardX = lerp(cardX, tX, 0.085);
    cardY = lerp(cardY, tY, 0.085);

    // Rotation 0 → 180
    const rotateY = heroProgress * 180;
    const leanZ   = clamp(scrollVel, -7, 7);
    const floatY  = Math.sin(heroProgress * Math.PI) * -14;
    const mTiltX  = (1 - heroProgress) * tiltX;
    const mTiltY  = (1 - heroProgress) * tiltY;

    // ── OPACITY: Card FULLY disappears before Projects section enters ──
    const projectsEl = document.getElementById('projects');
    const projectsTop = projectsEl ? projectsEl.offsetTop : skillsBot;

    // Fade starts when projects top enters bottom of screen, ends before overlapping card
    const fadeStart = projectsTop - vh;
    const fadeEnd   = projectsTop - (vh * 0.5 + CARD_H / 2 + 60);
    let opacity = 1;

    if (scrollY <= fadeStart) {
      opacity = 1;
    } else if (scrollY >= fadeEnd) {
      opacity = 0;
    } else {
      opacity = clamp(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart), 0, 1);
    }


    // Apply
    if (floatCard) {
      floatCard.style.left    = cardX.toFixed(1) + 'px';
      floatCard.style.top     = cardY.toFixed(1) + 'px';
      floatCard.style.opacity = opacity.toFixed(3);
    }
    if (fcInner) {
      fcInner.style.transform = `
        rotateX(${mTiltX.toFixed(2)}deg)
        rotateY(${(rotateY + mTiltY).toFixed(2)}deg)
        rotateZ(${leanZ.toFixed(2)}deg)
        translateY(${floatY.toFixed(1)}px)
      `;
    }

    updateStack();
    updateTimeline();
    updateNav();
    updateWork();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ─────────────────────────────────────────────────────
     WORK — pinned horizontal scroll gallery
     Vertical scroll through #work-pin drives a horizontal
     translate of the track; panels scale/parallax into focus.
     ───────────────────────────────────────────────────── */
  const workPin    = $('#work-pin');
  const workTrack  = $('#work-track');
  const workPanels = $$('.work-panel');
  const workFill   = $('#work-progress-fill');
  const workCur    = $('#work-cur');
  let   workMaxX   = 0;

  function layoutWork() {
    if (!workPin || !workTrack) return;
    workMaxX = Math.max(0, workTrack.scrollWidth - window.innerWidth);
    // 1px of horizontal travel per 1px of vertical scroll + one viewport to read the last panel
    workPin.style.height = (workMaxX + window.innerHeight) + 'px';
  }

  function updateWork() {
    if (!workPin || !workTrack) return;
    const total    = workPin.offsetHeight - window.innerHeight;
    const scrolled = clamp(-workPin.getBoundingClientRect().top, 0, total);
    const progress = total > 0 ? scrolled / total : 0;

    workTrack.style.transform = `translate3d(${(-progress * workMaxX).toFixed(1)}px,0,0)`;
    if (workFill) workFill.style.transform = `scaleX(${progress.toFixed(4)})`;

    const cx = window.innerWidth / 2;
    let activeIdx = 0, best = Infinity;
    workPanels.forEach((panel, i) => {
      const r = panel.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const dist   = Math.abs(center - cx);
      const t      = clamp(1 - dist / (window.innerWidth * 0.6), 0, 1); // 1 at center → 0 at edges
      panel.style.setProperty('--t', t.toFixed(3));
      panel.style.transform = `scale(${(0.9 + t * 0.1).toFixed(3)})`;
      panel.classList.toggle('is-active', t > 0.62);
      if (dist < best) { best = dist; activeIdx = i; }
    });
    if (workCur) workCur.textContent = String(activeIdx + 1).padStart(2, '0');
  }

  layoutWork();
  window.addEventListener('load', layoutWork);

  /* ─────────────────────────────────────────────────────
     11. SCROLL REVEAL (IntersectionObserver)
     ───────────────────────────────────────────────────── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const delay = +(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('revealed'), delay);
      revObs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal-fade, .exp-row, .reveal-left, .reveal-right').forEach(el => revObs.observe(el));

  /* ─────────────────────────────────────────────────────
     12. EDUCATION TIMELINE SCROLL-LINKED ANIMATION
     ───────────────────────────────────────────────────── */
  const eduTimeline = $('.edu-timeline');
  const eduLine     = $('#edu-line');
  const eduItems    = $$('.edu-item');

  function updateTimeline() {
    if (!eduTimeline || !eduLine) return;
    const rect = eduTimeline.getBoundingClientRect();
    const vh = window.innerHeight;
    
    // Start drawing when timeline top reaches 65% of viewport height
    const startY = rect.top - vh * 0.65;
    const endY = rect.bottom - vh * 0.65;
    const totalDist = rect.height;
    
    let progress = 0;
    if (startY < 0) {
      progress = clamp(-startY / totalDist, 0, 1);
    }
    
    eduLine.style.setProperty('--line-fill', (progress * 100).toFixed(1) + '%');
    
    eduItems.forEach(item => {
      const dot = $('.edu-dot', item);
      if (!dot) return;
      const dotRect = dot.getBoundingClientRect();
      if (dotRect.top < vh * 0.65) {
        item.classList.add('timeline-active');
      } else {
        item.classList.remove('timeline-active');
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     13. COUNT-UP ANIMATION for stats
     ───────────────────────────────────────────────────── */
  function countUp(el, target, suffix = '') {
    const duration = 1400, start = Date.now(), from = 0;
    function tick() {
      const t = Math.min((Date.now() - start) / duration, 1);
      const e = 1 - (1 - t) ** 3;
      el.textContent = Math.round(from + (target - from) * e) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const raw = el.dataset.count;
      if (raw !== undefined) countUp(el, parseFloat(raw), el.dataset.suffix || '');
      statsObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => statsObs.observe(el));

  /* ─────────────────────────────────────────────────────
     14. MAGNETIC BUTTONS
     ───────────────────────────────────────────────────── */
  $$('.btn-solid, .btn-outline, .bn-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  /* ─────────────────────────────────────────────────────
     15. SKILL CARD 3D TILT
     ───────────────────────────────────────────────────── */
  skillCards.forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('is-hovered'));
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hovered');
      applyCardTransform(card);                     // rAF loop resumes control
    });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      const lift = (card._scale != null ? card._scale : 1) * 1.02;
      card.style.transform =
        `perspective(1100px) ` +
        `translateY(${(card._ty || 0).toFixed(1)}px) translateX(${(card._tx != null ? card._tx : 0).toFixed(1)}px) ` +
        `rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg) ` +
        `rotate(${(card._rot != null ? card._rot : card._restRot).toFixed(2)}deg) scale(${lift.toFixed(4)})`;
    });
  });

  /* ─────────────────────────────────────────────────────
     16. PROJECT CARD 3D TILT
     ───────────────────────────────────────────────────── */
  $$('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, box-shadow 0.4s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s var(--ease), box-shadow 0.4s ease';
      card.style.transform  = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0)';
    });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(1200px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg) translateY(-6px)`;
    });
  });

  /* ─────────────────────────────────────────────────────
     17. HERO PARALLAX — names drift apart on scroll
     ───────────────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH   = heroEl ? heroEl.offsetHeight : window.innerHeight;
    if (scrollY > heroH) return;
    const p = scrollY / heroH;
    const left  = $('.hero-name-left');
    const right = $('.hero-name-right');
    if (left)  left.style.transform  = `translateX(${-p * 55}px)`;
    if (right) right.style.transform = `translateX(${p * 55}px)`;
    const hex = $('#hex-bg');
    if (hex) hex.style.transform = `translateY(${p * 45}px)`;
  }, { passive: true });

  /* Floating code tokens — depth parallax on mouse move */
  const codeToks = $$('#hero-code-float .ctok');
  if (codeToks.length) {
    document.addEventListener('mousemove', e => {
      const nx = (e.clientX / window.innerWidth  - 0.5);
      const ny = (e.clientY / window.innerHeight - 0.5);
      codeToks.forEach(tok => {
        const d = parseFloat(tok.dataset.depth) || 1;
        tok.style.translate = `${(-nx * d * 26).toFixed(1)}px ${(-ny * d * 20).toFixed(1)}px`;
      });
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────
     18. TEXT SCRAMBLE on .exp-co hover
     ───────────────────────────────────────────────────── */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#';
  $$('.exp-co').forEach(el => {
    const orig = el.textContent;
    let raf;
    el.addEventListener('mouseenter', () => {
      let frame = 0;
      cancelAnimationFrame(raf);
      (function scramble() {
        el.textContent = orig.split('').map((c, i) =>
          frame > i * 1.2 ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('');
        frame++;
        if (frame < orig.length * 1.5) raf = requestAnimationFrame(scramble);
        else el.textContent = orig;
      })();
    });
    el.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); el.textContent = orig; });
  });

  /* ─────────────────────────────────────────────────────
     19. SMOOTH ANCHOR SCROLL
     ───────────────────────────────────────────────────── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─────────────────────────────────────────────────────
     20. RESIZE HANDLER
     ───────────────────────────────────────────────────── */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const c = getAnchorCenter();
      cardX = c.x; cardY = c.y;
      moveIndicator(navCurrentTarget);   // link offsets shift when the nav re-centers
      layoutWork();                      // recompute pin height + horizontal travel
    }, 100);
  });

})();
