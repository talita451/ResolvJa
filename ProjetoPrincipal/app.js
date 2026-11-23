// ResolvJá - Script principal unificado com animação de clique do mouse e sem popups automáticos
const API_URL = window.location.origin;

function inicializarAnimacaoCliqueMouse() {
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'mouse-click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
}

function obterUsuarioAtual() {
  try {
    const raw = localStorage.getItem('resolvja_usuario');
    return raw ? JSON.parse(raw) : { nome: 'talita souza prates da silva', email: '', tipo: 'cliente' };
  } catch (e) {
    return { nome: 'talita souza prates da silva', email: '', tipo: 'cliente' };
  }
}

function inicializarMenuPerfil() {
  const avatarBtn = document.getElementById('avatarMenuBtn');
  const dropdown = document.getElementById('profileDropdown');
  if (!avatarBtn || !dropdown) return;

  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  const btnAlternar = document.getElementById('btnAlternarPerfil');
  if (btnAlternar) {
    btnAlternar.addEventListener('click', () => {
      const user = obterUsuarioAtual();
      user.tipo = user.tipo === 'prestador' ? 'cliente' : 'prestador';
      localStorage.setItem('resolvja_usuario', JSON.stringify(user));
      dropdown.classList.remove('open');
    });
  }

  const btnSair = document.getElementById('btnSairConta');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      localStorage.removeItem('resolvja_usuario');
      window.location.href = 'login.html';
    });
  }
}

async function buscarEnderecoPorCep(cepInput, enderecoInput) {
  if (!cepInput || !enderecoInput) return;
  const cepLimpo = cepInput.value.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return;

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await resp.json();
    if (!data.erro) {
      const partes = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean);
      enderecoInput.value = partes.join(', ');
    }
  } catch (err) {
    console.warn('Falha ao consultar ViaCEP:', err);
  }
}

function inicializarFormularioSolicitacao() {
  const form = document.getElementById('formSolicitarServico');
  if (!form) return;

  const cepInput = document.getElementById('cepAtendimento');
  const enderecoInput = document.getElementById('enderecoAtendimento');

  if (cepInput && enderecoInput) {
    cepInput.addEventListener('blur', () => buscarEnderecoPorCep(cepInput, enderecoInput));
    cepInput.addEventListener('input', () => {
      const digits = cepInput.value.replace(/\D/g, '').slice(0, 8);
      cepInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
      if (digits.length === 8) {
        buscarEnderecoPorCep(cepInput, enderecoInput);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = obterUsuarioAtual();
    const payload = {
      servico: document.getElementById('servicoSolicitado')?.value || 'Serviço Geral',
      profissao: document.getElementById('profissaoSolicitada')?.value || 'marido de aluguel',
      data_atendimento: document.getElementById('dataAtendimento')?.value || '',
      hora_atendimento: document.getElementById('horaAtendimento')?.value || '',
      cep: cepInput?.value || '',
      endereco: enderecoInput?.value || '',
      descricao: document.getElementById('descricaoServico')?.value || '',
      cliente_id: user.id || null,
      cliente_email: user.email || ''
    };

    try {
      const resp = await fetch(`${API_URL}/api/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Falha ao enviar');
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Erro ao enviar solicitação:', err);
    }
  });
}

let solicitacoesCache = [];

function renderizarSolicitacoes(lista) {
  const container = document.getElementById('listaSolicitacoes');
  if (!container) return;

  solicitacoesCache = Array.isArray(lista) ? lista : [];
  if (solicitacoesCache.length === 0) {
    container.innerHTML = '<p class="panel-subtitle">Nenhuma solicitação encontrada.</p>';
    return;
  }

  container.innerHTML = solicitacoesCache.map((item) => {
    const status = String(item.status || 'pendente').toLowerCase();
    const confirmado = Boolean(item.aceite_confirmado || item.aceiteConfirmado);
    let acaoAceite = '';

    if (status === 'aceito') {
      acaoAceite = confirmado
        ? '<span class="badge-confirmado">Aceite visualizado</span>'
        : `<button type="button" class="btn-confirmar-aceite" data-confirmar-aceite="${item.id}">Confirmar que vi o aceite</button>`;
    }

    return `
      <div class="solicitacao-item" data-id="${item.id}">
        <div>
          <strong>${item.servico || item.profissao || 'Serviço'}</strong>
          <div class="panel-subtitle" style="margin-bottom:0;">
            ${item.data_atendimento || ''} ${item.hora_atendimento || ''} — ${item.endereco || ''} (Status: ${status})
          </div>
        </div>
        <div>${acaoAceite}</div>
      </div>
    `;
  }).join('');
}

async function carregarSolicitacoes() {
  const container = document.getElementById('listaSolicitacoes');
  if (!container) return;

  const user = obterUsuarioAtual();
  const params = new URLSearchParams();
  if (user.id) params.set('clienteId', user.id);
  if (user.email) params.set('email', user.email);

  try {
    const url = `${API_URL}/api/solicitacoes${params.toString() ? `?${params.toString()}` : ''}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const dados = await resp.json();
    renderizarSolicitacoes(dados);
  } catch (err) {
    console.warn('Falha ao carregar solicitações da API:', err.message);
    container.innerHTML = '<p class="erro-msg">Erro ao carregar suas solicitações.</p>';
  }
}

function inicializarConfirmacaoAceite() {
  const container = document.getElementById('listaSolicitacoes');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-confirmar-aceite]');
    if (!btn) return;

    const id = btn.getAttribute('data-confirmar-aceite');
    btn.disabled = true;

    try {
      await fetch(`${API_URL}/api/solicitacoes/${id}/confirmar-aceite`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.warn('Atualização local aplicada:', err.message);
    }

    solicitacoesCache = solicitacoesCache.map((s) =>
      String(s.id) === String(id) ? { ...s, aceite_confirmado: true } : s
    );
    renderizarSolicitacoes(solicitacoesCache);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const user = obterUsuarioAtual();
  const saudacaoEl = document.getElementById('saudacaoUsuario');
  if (saudacaoEl && user.nome) {
    saudacaoEl.textContent = `Olá, ${user.nome}!`;
  }

  inicializarAnimacaoCliqueMouse();
  inicializarMenuPerfil();
  inicializarFormularioSolicitacao();
  inicializarConfirmacaoAceite();
  carregarSolicitacoes();
});
