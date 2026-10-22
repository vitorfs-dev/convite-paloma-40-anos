/* ============================================================
   main.js — orquestra a experiência
   ============================================================ */
(function () {
  'use strict';

  var A = window.InviteAnim || { playHero: function () {}, init: function () {} };

  // Animações de rolagem são preparadas desde já (a página fica travada atrás dos portões)
  A.init();

  // Hero: dispara quando a abertura está terminando
  document.addEventListener('invitation:reveal', function () { A.playHero(); });

  // Ao concluir a abertura, recalcula posições e garante o topo
  document.addEventListener('invitation:opened', function () {
    window.scrollTo(0, 0);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  // Imagens "lazy" mudam a altura do layout: recalcula ao terminar
  window.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });

  // Rede de segurança: se o GSAP não carregou, nada fica invisível
  if (typeof gsap === 'undefined') document.documentElement.classList.remove('js-anim');

  // Botões: resposta ao toque (brilho dourado + leve escala)
  Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (b) {
    var t = 0;
    b.addEventListener('pointerdown', function () { clearTimeout(t); b.classList.add('is-lit'); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      b.addEventListener(ev, function () { clearTimeout(t); t = setTimeout(function () { b.classList.remove('is-lit'); }, 700); });
    });
  });
})();
