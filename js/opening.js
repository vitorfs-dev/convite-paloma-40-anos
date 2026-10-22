/* ============================================================
   opening.js — Abertura cinematográfica dos portões (GSAP)
   Projeto original preservado. Acréscimos:
     • "invitation:start"  → disparado no toque (gatilho da música)
     • "invitation:reveal" → quando a abertura está terminando (inicia a Hero)
     • "invitation:opened" → abertura concluída
   Estados: initial → opening → completed
   ============================================================ */
(function () {
  'use strict';

  var STATE = { INITIAL: 'initial', OPENING: 'opening', COMPLETED: 'completed' };
  var PARTICLES = window.matchMedia('(max-width: 600px)').matches ? 12 : 20;

  function emit(name) { document.dispatchEvent(new CustomEvent(name)); }

  /* ---------- Timeline (4 fases) ---------- */
  function createTimeline(ui, onComplete) {
    var tl = gsap.timeline({ paused: true, onComplete: onComplete });

    var zoomScale = function () {
      return Math.max(3.2, (window.innerWidth / ui.stage.offsetWidth) * 2.6);
    };
    var rand = gsap.utils.random;
    var spread = function () { return Math.min(window.innerWidth, window.innerHeight); };

    gsap.set(ui.left,  { transformOrigin: '0% 50%',   rotateY: 0 });
    gsap.set(ui.right, { transformOrigin: '100% 50%', rotateY: 0 });
    gsap.set(ui.sheens, { xPercent: -160, skewX: -18 });

    // FASE 1 — Antecipação
    tl.addLabel('antecipacao', 0)
      .to(ui.hint,   { opacity: 0, duration: 0.4, ease: 'power1.out' }, 'antecipacao')
      .to(ui.sheens, { xPercent: 380, duration: 0.9, ease: 'power1.inOut' }, 'antecipacao')
      .to(ui.camera, { scale: 1.04, duration: 0.6, ease: 'power1.out' }, 'antecipacao')
      .to(ui.glow,   { opacity: 0.3, duration: 0.6, ease: 'power1.out' }, 'antecipacao');

    // FASE 2 — Abertura dos portões (rotação 3D)
    tl.addLabel('abertura', 0.6)
      .to(ui.left,   { rotateY:  102, duration: 2.5, ease: 'power2.inOut' }, 'abertura')
      .to(ui.right,  { rotateY: -102, duration: 2.5, ease: 'power2.inOut' }, 'abertura')
      .to(ui.shades, { opacity: 0.55, duration: 2.5, ease: 'power1.in' },    'abertura')
      .to(ui.glow,   { opacity: 0.95, scale: 1.35, duration: 2.5, ease: 'power2.inOut' }, 'abertura');

    // FASE 3 — Dolly-in pelo centro
    tl.addLabel('zoom', 3.1)
      .to(ui.camera, { scale: zoomScale, duration: 1.5, ease: 'power3.in' }, 'zoom');

    // FASE 4 — Transição luminosa
    tl.addLabel('luz', 3.7)
      .to(ui.particles, { x: function () { return rand(-0.4, 0.4) * spread(); },
                          y: function () { return rand(-0.4, 0.4) * spread(); },
                          duration: 1.4, ease: 'power2.out', stagger: 0.03 }, 'luz')
      .to(ui.particles, { keyframes: [{ opacity: 0.9, duration: 0.35 }, { opacity: 0, duration: 0.9 }],
                          stagger: 0.03 }, 'luz')
      .to(ui.bloom, { opacity: 0.85, scale: 2.2, duration: 1, ease: 'power2.in' }, 'luz')
      .to(ui.stage, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 'luz+=0.3')
      .to(ui.glow,  { opacity: 0, duration: 0.6 }, 'luz+=0.5')
      .to(ui.bloom, { opacity: 0, duration: 0.6, ease: 'power1.out' }, 'luz+=1')
      // a Hero começa a se revelar enquanto a camada ainda se dissolve
      .call(function () { emit('invitation:reveal'); }, null, 'luz+=0.9')
      .to(ui.root,  { opacity: 0, duration: 0.7, ease: 'power1.inOut' }, 'luz+=1.1');

    return tl;
  }

  /* ---------- Inicialização ---------- */
  function initOpening() {
    var root = document.querySelector('[data-opening-root]');
    if (!root) return null;

    var html = document.documentElement;
    var hero = document.querySelector(root.getAttribute('data-hero') || '#hero');
    var state = STATE.INITIAL;
    var tl = null;
    var revealed = false;

    function setState(next) {
      state = next;
      root.setAttribute('data-state', next);
      html.setAttribute('data-opening', next);
    }

    function reveal() { if (!revealed) { revealed = true; emit('invitation:reveal'); } }

    function finish() {
      if (state === STATE.COMPLETED) return;
      reveal();
      root.hidden = true;
      window.scrollTo(0, 0);                 // a página sempre começa no topo
      root.removeEventListener('click', start);
      root.removeEventListener('keydown', onKey);
      setState(STATE.COMPLETED);
      if (hero) {
        hero.removeAttribute('inert');
        hero.removeAttribute('aria-hidden');
        hero.focus({ preventScroll: true });
      }
      emit('invitation:opened');
    }

    function start() {
      if (state !== STATE.INITIAL) return;
      setState(STATE.OPENING);
      emit('invitation:start');            // síncrono dentro do gesto do usuário → libera o áudio

      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (typeof gsap === 'undefined') { finish(); return; }
      if (reduced) { gsap.to(root, { opacity: 0, duration: 0.4, onComplete: finish }); return; }

      if (!tl) {
        var q = function (s) { return root.querySelector(s); };
        var qa = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
        var box = q('.opening__particles');
        for (var i = 0; i < PARTICLES; i++) box.appendChild(document.createElement('span'));

        tl = createTimeline({
          root: root,
          camera: q('.opening__camera'),
          stage: q('.opening__stage'),
          left: q('.leaf--left'),
          right: q('.leaf--right'),
          sheens: qa('.leaf__sheen i'),
          shades: qa('.leaf__shade'),
          glow: q('.opening__glow'),
          bloom: q('.opening__bloom'),
          hint: q('.opening__hint'),
          particles: qa('.opening__particles span')
        }, finish);
      }
      tl.play(0);
    }

    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); start(); }
    }

    window.scrollTo(0, 0);
    window.addEventListener('load', function () { if (state !== STATE.COMPLETED) window.scrollTo(0, 0); });
    setState(STATE.INITIAL);
    if (hero) { hero.setAttribute('inert', ''); hero.setAttribute('aria-hidden', 'true'); }
    root.addEventListener('click', start);
    root.addEventListener('keydown', onKey);
    root.focus({ preventScroll: true });

    return { start: start, getState: function () { return state; } };
  }

  window.RoyalOpening = { init: initOpening, createTimeline: createTimeline };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOpening);
  else initOpening();
})();
