/* ============================================================
   audio.js — trilha sonora (instância única) e controle flutuante
   ============================================================ */
(function () {
  'use strict';

  var cfg = (window.CONVITE_CONFIG && window.CONVITE_CONFIG.music) || { volume: 0.6, fadeInSeconds: 3.5 };
  var audio = document.getElementById('trilha');
  var btn = document.querySelector('[data-music]');
  if (!audio || !btn) return;

  var wantPlaying = false;     // intenção do usuário (play/pause manual)
  var started = false;
  var fadeRaf = 0;

  audio.volume = 0;

  function setUI(playing) {
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música');
  }

  function fadeTo(target, seconds) {
    cancelAnimationFrame(fadeRaf);
    var from = audio.volume, t0 = performance.now(), dur = Math.max(0.05, seconds) * 1000;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * (k * (2 - k))));   // ease-out
      if (k < 1) fadeRaf = requestAnimationFrame(step);
    })(t0);
  }

  function play() {
    wantPlaying = true;
    var p;
    try { p = audio.play(); } catch (e) { p = Promise.reject(e); }
    if (p && p.then) {
      p.then(function () { setUI(true); fadeTo(cfg.volume, started ? 0.8 : cfg.fadeInSeconds); started = true; })
       .catch(function () { wantPlaying = false; setUI(false); });   // bloqueado: usuário pode tocar no botão
    } else { setUI(true); fadeTo(cfg.volume, cfg.fadeInSeconds); started = true; }
  }

  function pause() {
    wantPlaying = false;
    fadeTo(0, 0.5);
    setTimeout(function () { if (!wantPlaying) audio.pause(); }, 520);
    setUI(false);
  }

  // Início: dentro do gesto de toque nos portões
  document.addEventListener('invitation:start', play);

  // O botão aparece quando a Hero começa a ser revelada
  document.addEventListener('invitation:reveal', function () {
    btn.hidden = false;
    btn.style.opacity = '0';
    requestAnimationFrame(function () { btn.style.opacity = '1'; });
  });

  btn.addEventListener('click', function () { (audio.paused || !wantPlaying) ? play() : pause(); });

  // Pausa ao sair da aba; retoma ao voltar (somente se estava tocando)
  var resumeOnVisible = false;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { resumeOnVisible = wantPlaying && !audio.paused; if (resumeOnVisible) audio.pause(); }
    else if (resumeOnVisible) { resumeOnVisible = false; audio.play().catch(function () {}); }
  });

  // Falha ao carregar o arquivo: some o botão, convite segue funcionando
  audio.addEventListener('error', function () { btn.hidden = true; });

  window.InviteAudio = { play: play, pause: pause };
})();
