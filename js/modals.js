/* ============================================================
   modals.js — modais acessíveis (foco, Esc, clique fora, rolagem)
   ============================================================ */
(function () {
  'use strict';

  var cfg = window.CONVITE_CONFIG || {};
  var html = document.documentElement;
  var page = document.getElementById('convite');
  var music = document.querySelector('[data-music]');
  var openModal = null, lastTrigger = null, closeTimer = 0;

  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

  /* ---------- WhatsApp ---------- */
  var wa = document.querySelector('[data-whatsapp]');
  if (wa && cfg.whatsapp) {
    wa.href = 'https://wa.me/' + cfg.whatsapp.number + '?text=' + encodeURIComponent(cfg.whatsapp.message);
  }

  /* ---------- Presente solidário (QR + link) ---------- */
  var gift = cfg.gift || {};
  var qrBox = document.querySelector('[data-qr-box]');
  var copyBtn = document.querySelector('[data-copy-link]');
  var giftNote = document.querySelector('[data-gift-note]');

  if (gift.qrImage && qrBox) {
    var img = new Image();
    img.alt = 'QR Code para contribuição';
    img.onload = function () { qrBox.textContent = ''; qrBox.appendChild(img); };
    img.src = gift.qrImage;                    // se falhar, o placeholder permanece
  }
  if (giftNote && gift.link) giftNote.textContent = 'Toque no botão para copiar o link da contribuição.';
  if (copyBtn) {
    if (!gift.link) copyBtn.setAttribute('aria-disabled', 'true');
    copyBtn.addEventListener('click', function () {
      if (!gift.link) { giftNote.textContent = 'O link será disponibilizado em breve.'; return; }
      copyText(gift.link).then(function () { giftNote.textContent = 'Link copiado!'; })
        .catch(function () { giftNote.textContent = 'Não foi possível copiar. Link: ' + gift.link; });
    });
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      document.body.removeChild(ta);
    });
  }

  /* ---------- Rolagem ---------- */
  function lockScroll() {
    var sbw = window.innerWidth - html.clientWidth;
    if (sbw > 0) html.style.paddingRight = sbw + 'px';
    html.classList.add('modal-open');
  }
  function unlockScroll() { html.classList.remove('modal-open'); html.style.paddingRight = ''; }

  // Impede a rolagem do fundo por toque (iOS) fora do painel
  document.addEventListener('touchmove', function (e) {
    if (!openModal) return;
    var panel = openModal.querySelector('[data-modal-panel]');
    if (!panel.contains(e.target) || panel.scrollHeight <= panel.clientHeight) e.preventDefault();
  }, { passive: false });

  /* ---------- Abrir / fechar ---------- */
  function open(id, trigger) {
    var modal = document.getElementById(id);
    if (!modal || openModal) return;
    clearTimeout(closeTimer);
    openModal = modal; lastTrigger = trigger || document.activeElement;
    lockScroll();
    if (page) { page.setAttribute('inert', ''); page.setAttribute('aria-hidden', 'true'); }
    if (music) music.setAttribute('inert', '');
    modal.hidden = false;
    void modal.offsetWidth;                       // força reflow p/ a transição
    modal.classList.add('is-open');
    var panel = modal.querySelector('[data-modal-panel]');
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });
    panel.scrollTop = 0;
  }

  function close() {
    if (!openModal) return;
    var modal = openModal; openModal = null;
    modal.classList.remove('is-open');
    var finish = function () {
      modal.hidden = true;
      unlockScroll();
      if (page) { page.removeAttribute('inert'); page.removeAttribute('aria-hidden'); }
      if (music) music.removeAttribute('inert');
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    };
    closeTimer = setTimeout(finish, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-modal]');
    if (t) { e.preventDefault(); open(t.getAttribute('data-open-modal'), t); return; }
    if (!openModal) return;
    if (e.target.closest('[data-close-modal]') || e.target === openModal) close();   // X ou clique fora
  });

  document.addEventListener('keydown', function (e) {
    if (!openModal) return;
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var items = Array.prototype.filter.call(openModal.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null; });
    var panel = openModal.querySelector('[data-modal-panel]');
    if (!items.length) { e.preventDefault(); return; }
    var first = items[0], last = items[items.length - 1], active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  });

  window.InviteModals = { open: open, close: close };
})();
