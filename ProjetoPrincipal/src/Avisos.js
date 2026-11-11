/* ==========================================================================
   AVISOS: sem pop-ups de sucesso + "Faça login" clicável
   Carregar DEPOIS do script.js
   ========================================================================== */
   (function () {
    // true  = mantém só os avisos de ERRO (senha errada, campo faltando...)
    // false = remove TODOS os pop-ups, inclusive os de erro
    var MOSTRAR_ERROS = true;
  
    var toast = document.getElementById('toast-central');
    var timer = null;
  
    var RE_LOGIN = /fa[çc]a\s+(o\s+|seu\s+)?login|fazer\s+login|entre\s+(na\s+sua\s+)?conta|precisa\s+(estar\s+)?logad/i;
    var RE_ERRO  = /erro|falha|inv[áa]lid|incorret|n[ãa]o foi|obrigat|preench|senha|n[ãa]o encontrad|j[áa] (existe|cadastrad)/i;
  
    function ehErro(msg, tipo) {
      if (tipo) return /erro|error|falha|aviso/i.test(tipo);
      return RE_ERRO.test(msg);
    }
  
    function irParaLogin() {
      if (typeof window.showPage === 'function') window.showPage('login');
    }
  
    function esconder() {
      clearTimeout(timer);
      if (!toast) return;
      toast.style.display = 'none';
      toast.classList.remove('toast-clicavel');
      toast.onclick = null;
    }
  
    /* ---------- Pop-ups (toast) ---------- */
    window.mostrarToast = function (msg, tipo) {
      if (!toast) return;
      msg = String(msg == null ? '' : msg);
  
      var login = RE_LOGIN.test(msg);
      var erro = ehErro(msg, tipo);
  
      // Sucesso/informação ("Serviço solicitado", "Cadastro realizado"...) não aparece mais
      if (!login && (!erro || !MOSTRAR_ERROS)) { esconder(); return; }
  
      clearTimeout(timer);
      toast.textContent = msg;
      toast.classList.remove('toast-clicavel');
      toast.onclick = esconder;
      toast.style.background = 'var(--error)';
  
      if (login) {
        toast.textContent = '';
        toast.appendChild(document.createTextNode(msg));
        var dica = document.createElement('u');
        dica.textContent = 'Clique aqui para entrar';
        dica.style.marginLeft = '8px';
        toast.appendChild(dica);
        toast.classList.add('toast-clicavel');
        toast.style.background = 'var(--accent)';
        toast.onclick = function () { esconder(); irParaLogin(); };
      }
  
      toast.style.display = 'block';
      timer = setTimeout(esconder, login ? 6000 : 3500);
    };
  
    // alert() do navegador passa pelo mesmo filtro (nunca mais abre caixa)
    window.alert = function (msg) { window.mostrarToast(msg); };
  
    /* ---------- Texto "Faça login..." dentro das telas fica clicável ---------- */
    function marcarAvisosDeLogin() {
      var els = document.querySelectorAll('main *');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.classList.contains('aviso-login-link')) continue;
        if (el.closest('#toast-central')) continue;
        var txt = el.textContent || '';
        if (txt.length > 120 || !RE_LOGIN.test(txt)) continue;
        var filhoTambem = false;
        for (var j = 0; j < el.children.length; j++) {
          if (RE_LOGIN.test(el.children[j].textContent || '')) { filhoTambem = true; break; }
        }
        if (filhoTambem) continue;
        // não marca botões/links que já são de login/entrar normais
        if (el.matches('button, a, label, input, h2, h3')) continue;
        el.classList.add('aviso-login-link');
        el.setAttribute('role', 'link');
        el.setAttribute('tabindex', '0');
        el.title = 'Clique para ir ao login';
      }
    }
  
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('.aviso-login-link');
      if (el) { e.preventDefault(); irParaLogin(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('aviso-login-link')) irParaLogin();
    });
  
    var agendado = false;
    new MutationObserver(function () {
      if (agendado) return;
      agendado = true;
      setTimeout(function () { agendado = false; marcarAvisosDeLogin(); }, 50);
    }).observe(document.body, { childList: true, subtree: true });
  
    marcarAvisosDeLogin();
  })();