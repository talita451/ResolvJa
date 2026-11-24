// ==========================================================================
// CLIQUE.JS - Animação de clique (anel) e cursor personalizado
// ==========================================================================
(function () {
    if (window.__cliqueFx) return;
    window.__cliqueFx = true;

    var USAR_CURSOR = true; // false = só o anelzinho, mantendo o cursor normal do sistema

    // Campos de texto (mantêm o cursor "I" do sistema) e itens clicáveis (cursor laranja)
    var TEXTO = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=file]):not([type=range]):not([type=color]):not([type=hidden]),textarea,[contenteditable=""],[contenteditable="true"]';
    var CLICAVEL = 'a,button,summary,select,label[for],[onclick],[role=button],input[type=checkbox],input[type=radio],input[type=button],input[type=submit],input[type=reset],input[type=file],.btn,.filter';

    var css =
      '.clique-fx-anel{position:fixed;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;' +
        'border:2px solid var(--accent,#F97316);pointer-events:none;z-index:2147483646;' +
        'animation:cliqueFxAnel .4s ease-out forwards}' +
      '@keyframes cliqueFxAnel{from{transform:scale(.4);opacity:.8}to{transform:scale(2.6);opacity:0}}' +
      '@keyframes cliqueFxFade{from{transform:scale(1.6);opacity:.8}to{transform:scale(1.6);opacity:0}}' +
      '@media (prefers-reduced-motion:reduce){.clique-fx-anel{animation:cliqueFxFade .3s ease-out forwards}}';

    if (USAR_CURSOR) {
      css +=
        'html.cc-ativo,html.cc-ativo *{cursor:none !important}' +
        'html.cc-ativo :is(' + TEXTO + '){cursor:text !important}' +
        '#clique-cursor{position:fixed;left:0;top:0;width:24px;height:28px;pointer-events:none;z-index:2147483647;will-change:transform}' +
        '#clique-cursor svg{display:block;transform-origin:2px 2px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));' +
          'transition:transform .18s cubic-bezier(.3,1.7,.5,1)}' +
        '#clique-cursor path{fill:#fff;stroke:#111;stroke-width:1.6;stroke-linejoin:round;transition:fill .15s}' +
        '#clique-cursor.cc-clicavel path{fill:var(--accent,#F97316)}' +
        '#clique-cursor.cc-apertado svg{transform:scale(.78);transition:transform .08s ease-out}' +
        '@media (prefers-reduced-motion:reduce){#clique-cursor svg{transition:none !important}}';
    }

    var estilo = document.createElement('style');
    estilo.id = 'clique-fx-style';
    estilo.textContent = css;
    (document.head || document.documentElement).appendChild(estilo);

    // ---- Anelzinho no ponto do clique ----
    document.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return; // ignora botão direito/meio
      var anel = document.createElement('span');
      anel.className = 'clique-fx-anel';
      anel.style.left = e.clientX + 'px';
      anel.style.top = e.clientY + 'px';
      (document.body || document.documentElement).appendChild(anel);
      setTimeout(function () { anel.remove(); }, 450);
    }, true);

    // ---- Cursor próprio (o navegador não deixa animar o cursor real) ----
    if (!USAR_CURSOR || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cur = document.createElement('div');
    cur.id = 'clique-cursor';
    cur.innerHTML = '<svg width="20" height="23" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M2 2 L2 22 L7.2 17.4 L10.8 25.4 L14.4 23.8 L10.9 16 L18 16 Z"/></svg>';
    (document.body || document.documentElement).appendChild(cur);

    var raiz = document.documentElement;
    var x = 0, y = 0, agendado = false, ativo = false, fora = false, apertadoEm = 0;

    function desenhar() {
      agendado = false;
      cur.style.transform = 'translate3d(' + (x - 2) + 'px,' + (y - 2) + 'px,0)';
    }

    function atualizarAlvo(t) {
      var campo = !!(t && t.closest && t.closest(TEXTO));
      cur.style.display = campo ? 'none' : 'block';
      cur.classList.toggle('cc-clicavel', !campo && !!(t && t.closest && t.closest(CLICAVEL)));
    }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      x = e.clientX; y = e.clientY;
      if (!ativo) { ativo = true; raiz.classList.add('cc-ativo'); atualizarAlvo(e.target); }
      if (fora) { fora = false; cur.style.opacity = ''; }
      if (!agendado) { agendado = true; requestAnimationFrame(desenhar); }
    }, { passive: true, capture: true });

    document.addEventListener('pointerover', function (e) {
      if (ativo && e.pointerType !== 'touch') atualizarAlvo(e.target);
    }, true);

    raiz.addEventListener('mouseleave', function () { fora = true; cur.style.opacity = '0'; });

    document.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.pointerType === 'touch') return;
      apertadoEm = Date.now();
      cur.classList.add('cc-apertado');
    }, true);

    function soltar() {
      var falta = Math.max(0, 90 - (Date.now() - apertadoEm));
      setTimeout(function () { cur.classList.remove('cc-apertado'); }, falta);
    }
    window.addEventListener('pointerup', soltar, true);
    window.addEventListener('pointercancel', soltar, true);
    window.addEventListener('blur', soltar);
})();
