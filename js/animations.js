/* ============================================================
   animations.js — GSAP + ScrollTrigger
   • playHero(): textos da Hero com animações independentes
   • initScroll(): revelações acionadas pela rolagem
   Só anima transform/opacity (+ máscara do nome).
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ok = typeof gsap !== 'undefined' && !reduced;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Sem GSAP / movimento reduzido: tudo visível e estático
  if (!ok) {
    document.documentElement.classList.remove('js-anim');
    window.InviteAnim = { playHero: function () {}, init: function () {} };
    return;
  }
  var hasST = typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  var heroPlayed = false, ambientOn = false;

  /* ---------- Brilhos e pétalas da Hero ---------- */
  function ambient() {
    if (ambientOn) return; ambientOn = true;
    $$('.sparkles i').forEach(function (s) { s.classList.add('on'); });
    var box = $('[data-petals]');
    var n = window.innerWidth < 600 ? 7 : 10;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i'); p.className = 'petal'; box.appendChild(p);
      var dur = gsap.utils.random(9, 15);
      gsap.set(p, { left: gsap.utils.random(6, 94) + '%', y: -40, opacity: 0 });
      gsap.timeline({ repeat: -1, delay: gsap.utils.random(0, 9) })
        .set(p, { y: -40, rotation: gsap.utils.random(0, 360), opacity: 0 })
        .to(p, { opacity: 0.9, duration: 1.2, ease: 'none' }, 0)
        .to(p, { y: function () { return box.clientHeight * 0.9; }, duration: dur, ease: 'none' }, 0)
        .to(p, { x: '+=' + gsap.utils.random(-50, 50), rotation: '+=' + gsap.utils.random(120, 300), duration: dur, ease: 'sine.inOut' }, 0)
        .to(p, { opacity: 0, duration: 1.4, ease: 'none' }, dur - 1.4);
    }
  }

  /* ---------- HERO: cada elemento com sua própria animação ---------- */
  function playHero() {
    if (heroPlayed) return; heroPlayed = true;
    var plate = $('[data-plate]'), wipe = $('[data-wipe]'), proxy = { p: 0 };
    var name = $('[data-name]'), orn = $('[data-orn]'), age = $('[data-age]'), phrase = $('[data-phrase]');
    var h = gsap.timeline();

    // câmera: aproximação suave entrando no palácio
    h.fromTo(plate, { scale: 1.09 }, { scale: 1, duration: 3.6, ease: 'power2.out', transformOrigin: '50% 62%', clearProps: 'transform' }, 0);

    wipe.style.setProperty('--p', '0%');
    h.set([name, orn, age, phrase], { opacity: 1 }, 0.3)
      .fromTo(proxy, { p: 0 }, { p: 1, duration: 2.3, ease: 'power2.inOut',
        onUpdate: function () { wipe.style.setProperty('--p', (proxy.p * 118) + '%'); } }, 0.5)
      .fromTo(name, { y: 10, scale: 0.97 }, { y: 0, scale: 1, duration: 2.6, ease: 'power2.out', transformOrigin: '50% 60%' }, 0.5)
      .fromTo(orn, { opacity: 0, scaleX: 0.15 }, { opacity: 1, scaleX: 1, duration: 1.4, ease: 'power2.out' }, 1.8)
      .fromTo(age, { opacity: 0, y: 12, letterSpacing: '.52em' }, { opacity: 1, y: 0, letterSpacing: '.3em', duration: 1.5, ease: 'power2.out' }, 2.2)
      .fromTo(phrase, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.6, ease: 'power2.out' }, 2.8)
      .call(ambient, null, 2.4)
      .call(function () { if (hasST) ScrollTrigger.refresh(); }, null, 4);
  }

  /* ---------- ROLAGEM ---------- */
  function reveal(el, vars, start) {
    gsap.fromTo(el, { opacity: 0, y: 28 }, Object.assign({ opacity: 1, y: 0, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: start || 'top 90%', once: true } }, vars || {}));
  }

  function initScroll() {
    if (!hasST) {
      $$('[data-h],[data-reveal],[data-line],[data-ev],[data-unit-wrap],[data-event-plate],[data-paper],.bfly,.btn,.gem,[data-castle],[data-finale-crown],[data-finale-name],[data-finale-phrase]')
        .forEach(function (e) { e.style.opacity = 1; });
      return;
    }

    // luz champanhe e poeira acompanham o percurso
    gsap.to('[data-light]', { yPercent: 28, ease: 'none', scrollTrigger: { trigger: '#convite', start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
    gsap.to('[data-dust]', { y: -120, ease: 'none', scrollTrigger: { trigger: '#convite', start: 'top top', end: 'bottom bottom', scrub: 1 } });

    // Hero: a cena se afasta um pouco mais devagar que a rolagem
    gsap.to('[data-par]', { y: 70, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });

    // revelações genéricas
    $$('[data-reveal]').forEach(function (el) { reveal(el); });

    /* ----- Mensagem: papel + borboletas ----- */
    var wrap = $('[data-paper-wrap]');
    if (wrap) {
      var paper = $('[data-paper]'), lines = $$('[data-line]'), flies = $$('[data-bfly]', wrap);
      var mt = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 82%', once: true } });
      mt.fromTo(paper, { opacity: 0, y: 80, scale: .93, rotation: 2.5 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.7, ease: 'power3.out' }, 0)
        .fromTo(lines, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.3, stagger: 0.6, ease: 'power2.out' }, 0.9);
      flies.forEach(function (f, i) {
        var side = (i % 2) ? 1 : -1;
        mt.fromTo(f, { opacity: 0, x: side * (70 + i * 14), y: -90 - i * 16, scale: .35 },
          { opacity: 1, x: 0, y: 0, scale: 1, duration: 2.1, ease: 'power3.out' }, 1.0 + i * 0.28)
          .add(function () {
            gsap.to(f, { y: '+=' + (5 + (i % 3) * 2), x: '+=' + (side * 3), duration: 2.6 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          }, 3.0 + i * 0.28);
      });
      gsap.to(paper, { y: -16, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    }

    /* ----- Contagem: medalhões surgem um a um ----- */
    var units = $$('[data-unit-wrap]');
    if (units.length) {
      gsap.fromTo(units, { opacity: 0, y: 34, scale: .82 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'back.out(1.4)', stagger: 0.18,
        scrollTrigger: { trigger: '[data-countdown]', start: 'top 88%', once: true } });
    }

    /* ----- Evento: cenário + textos em sequência ----- */
    var plate = $('[data-event-plate]');
    if (plate) {
      var et = gsap.timeline({ scrollTrigger: { trigger: plate, start: 'top 72%', once: true } });
      et.fromTo(plate, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
        .fromTo($('.event__img', plate), { scale: 1.06 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
        .fromTo('[data-ev="name"]', { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power2.inOut' }, 0.7);
      var rest = $$('[data-ev]', plate).filter(function (e) { return e.getAttribute('data-ev') !== 'name'; });
      et.fromTo(rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.28, ease: 'power2.out' }, 1.6);
      gsap.fromTo('.event__img', { y: 20 }, { y: -20, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    }

    /* ----- Botões: entrada progressiva, um após o outro ----- */
    var btns = $$('.btn'), gems = $$('.gem');
    if (btns.length) {
      var bt = gsap.timeline({ scrollTrigger: { trigger: '[data-actions]', start: 'top 86%', once: true } });
      btns.forEach(function (b, i) {
        bt.fromTo(b, { opacity: 0, y: 34, scale: .955 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', clearProps: 'transform' }, i * 0.28);
        if (gems[i]) bt.fromTo(gems[i], { opacity: 0, scaleX: .2 }, { opacity: 1, scaleX: 1, duration: .9, ease: 'power2.out' }, i * 0.28 + 0.5);
      });
    }

    /* ----- Footer ----- */
    var fin = $('#encerramento');
    if (fin) {
      var castle = $('[data-castle]'), crown = $('[data-finale-crown]'), nm = $('[data-finale-name]'), ph = $('[data-finale-phrase]'), glow = $('[data-finale-glow]');
      gsap.set(glow, { opacity: 0 });
      var ft = gsap.timeline({ scrollTrigger: { trigger: fin, start: 'top 62%', once: true } });
      ft.fromTo(castle, { opacity: 0, y: 40, filter: 'blur(9px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2.6, ease: 'power2.out' }, 0)
        .to(glow, { opacity: 1, duration: 2.4, ease: 'power1.out' }, 0.2)
        .fromTo(crown, { opacity: 0, y: -20, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: 'power3.out' }, 1.0)
        .fromTo(nm, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' }, 1.8)
        .fromTo(ph, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' }, 3.0);
      gsap.fromTo('.finale__castle img', { y: 24 }, { y: -18, ease: 'none', scrollTrigger: { trigger: fin, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 } });
    }
  }

  window.InviteAnim = { playHero: playHero, init: initScroll };
})();
