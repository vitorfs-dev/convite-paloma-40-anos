/* ============================================================
   countdown.js — contagem regressiva (Brasília, UTC-03:00)
   ============================================================ */
(function () {
  'use strict';

  var cfg = window.CONVITE_CONFIG || {};
  var target = new Date(cfg.eventDate || '2026-11-14T13:30:00-03:00').getTime();
  var root = document.querySelector('[data-countdown]');
  if (!root || isNaN(target)) return;

  var grid = root.querySelector('.count__grid');
  var done = root.querySelector('[data-done]');
  var sr = document.querySelector('[data-countdown-sr]');
  var el = {
    days: root.querySelector('[data-unit="days"]'),
    hours: root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]')
  };
  var timer = 0, lastMinute = -1;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {                       // nunca exibe números negativos
      clearInterval(timer);
      grid.hidden = true; grid.style.display = 'none';
      done.hidden = false;
      done.style.opacity = '1';
      if (sr) sr.textContent = 'O grande dia chegou!';
      return;
    }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600);  s -= h * 3600;
    var m = Math.floor(s / 60);    s -= m * 60;
    el.days.textContent = pad(d);
    el.hours.textContent = pad(h);
    el.minutes.textContent = pad(m);
    el.seconds.textContent = pad(s);
    if (sr && m !== lastMinute && (m % 15 === 0 || lastMinute === -1)) {   // leitor de tela: sem anunciar a cada segundo
      lastMinute = m;
      sr.textContent = 'Faltam ' + d + ' dias, ' + h + ' horas e ' + m + ' minutos para a festa.';
    }
  }

  tick();
  timer = setInterval(tick, 1000);
})();
