# Convite Paloma 40 anos

Convite digital em página única e contínua (HTML + CSS + JavaScript, sem build).

## Como abrir
1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
(Para testar no celular, abra pelo IP da sua rede, por exemplo `http://192.168.0.10:5500`.)

## O que é editável
`js/config.js`:
- `eventDate`: data da contagem regressiva (Brasília, UTC-03:00).
- `whatsapp`: número e mensagem do botão "Confirmar presença".
- `gift.link` e `gift.qrImage`: preencha quando tiver o link e o QR Code do presente solidário. Enquanto estiverem vazios, o modal mostra "QR Code em breve".

O link do botão "Como chegar" está em `index.html` (Google Maps).

## Estrutura
- `index.html` — conteúdo.
- `css/` — `opening.css` (portões), `style.css` (convite e modais), `animations.css`, `responsive.css`.
- `js/` — `opening.js` (abertura), `audio.js` (música), `countdown.js`, `modals.js`, `animations.js` (GSAP), `main.js`.
- `assets/images` — artes; `assets/opening` — portões; `assets/audio` — música; `assets/fonts`; `assets/vendor` — GSAP e ScrollTrigger locais.

## Publicar no GitHub Pages
Envie o conteúdo da pasta para um repositório e ative Settings → Pages. Todos os caminhos são relativos.
