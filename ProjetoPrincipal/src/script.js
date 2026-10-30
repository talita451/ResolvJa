const API_BASE_URL = 'http://localhost:3000/api';
window.historicoPaginas = ['home'];

window.compromissosAgenda = [
    {
        id: 1,
        titulo: 'Instalação de 3 Tomadas 220V',
        cliente: 'Carlos Roberto',
        endereco: 'Rua Principal, 102 - Centro',
        dataHora: 'Hoje às 14:00',
        tipoData: 'hoje',
        valor: 'R$ 150,00',
        status: 'CONFIRMADO'
    }
];

window.mostrarToast = function(mensagem) {
    const toast = document.getElementById('toast-central');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2200);
};

window.mascaraCep = function(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = valor;
};

// BUSCA DE CEP PARA SOLICITAÇÃO
window.buscarEnderecoPorCep = async function() {
    const cepInput = document.getElementById('reqCep');
    if (!cepInput) return;
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            window.mostrarToast('CEP não encontrado.');
            return;
        }
        document.getElementById('reqRua').value = data.logradouro || '';
        document.getElementById('reqBairro').value = data.bairro || '';
        document.getElementById('reqCidade').value = `${data.localidade} - ${data.uf}`;
        document.getElementById('reqNumero').focus();
        window.mostrarToast('Endereço carregado com sucesso!');
    } catch (e) {
        window.mostrarToast('Erro ao buscar o CEP');
    }
};

// BUSCA DE CEP PARA CADASTRO
window.buscarCepCadastro = async function() {
    const cepInput = document.getElementById('regCep');
    if (!cepInput) return;
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            window.mostrarToast('CEP não encontrado.');
            return;
        }
        document.getElementById('regRua').value = data.logradouro || '';
        document.getElementById('regBairro').value = data.bairro || '';
        document.getElementById('regCidade').value = `${data.localidade} - ${data.uf}`;
        document.getElementById('regNumero').focus();
        window.mostrarToast('Endereço de cadastro preenchido!');
    } catch (e) {
        window.mostrarToast('Erro ao buscar CEP');
    }
};

// VERIFICAR OUTRO SERVIÇO
window.verificarOutroServico = function(select) {
    const containerNovo = document.getElementById('container-novo-servico');
    const inputCustom = document.getElementById('reqTipoServicoCustom');
    
    if (select.value === 'Outros') {
        if (containerNovo) containerNovo.style.display = 'flex';
        if (inputCustom) inputCustom.setAttribute('required', 'true');
    } else {
        if (containerNovo) containerNovo.style.display = 'none';
        if (inputCustom) inputCustom.removeAttribute('required');
    }
};

// CADASTRAR NOVO SERVIÇO (FUNÇÃO + SOLICITAÇÃO)
window.submitRequest = async function(event) {
    event.preventDefault();

    const selectTipo = document.getElementById('selectTipoServico');
    let tipoServico = selectTipo ? selectTipo.value : 'Outros';

    if (tipoServico === 'Outros') {
        const inputCustom = document.getElementById('reqTipoServicoCustom');
        tipoServico = inputCustom ? inputCustom.value.trim() : 'Serviço Personalizado';
    }

    const titulo = document.getElementById('reqTitulo').value.trim();
    const descricao = document.getElementById('reqDescricao').value.trim();
    const dataServico = document.getElementById('reqData').value;
    
    const rua = document.getElementById('reqRua').value;
    const numero = document.getElementById('reqNumero').value;
    const bairro = document.getElementById('reqBairro').value;
    const cidade = document.getElementById('reqCidade').value;
    const endereco = `${rua}, ${numero} - ${bairro}, ${cidade}`;

    const novaSolicitacao = {
        id: Date.now(),
        tipoServico: tipoServico,
        titulo: titulo,
        descricao: descricao,
        data: dataServico,
        endereco: endereco,
        status: 'EM ANDAMENTO'
    };

    let solicitacoesSalvas = JSON.parse(localStorage.getItem('minhasSolicitacoes') || '[]');
    solicitacoesSalvas.push(novaSolicitacao);
    localStorage.setItem('minhasSolicitacoes', JSON.stringify(solicitacoesSalvas));

    adicionarNovaFuncaoAoCatalogo(tipoServico);

    window.mostrarToast('Nova função e solicitação criadas com sucesso!');
    window.carregarMinhasSolicitacoes();
};

function adicionarNovaFuncaoAoCatalogo(nomeServico) {
    const container = document.getElementById('container-catalogo-servicos');
    if (!container) return;

    const novoCard = document.createElement('div');
    novoCard.className = 'catalog-card';
    novoCard.setAttribute('data-nome', nomeServico.toLowerCase());
    novoCard.innerHTML = `
        <div class="catalog-body">
            <h3>${nomeServico}</h3>
            <p>Nova função cadastrada por solicitação personalizada.</p>
            <div class="catalog-footer">
                <span class="catalog-price">Valor <strong>A combinar</strong></span>
                <button class="btn btn-primary btn-sm" onclick="solicitarServicoCatalogo('${nomeServico}')">Solicitar</button>
            </div>
        </div>
    `;
    container.prepend(novoCard);
}

window.carregarMinhasSolicitacoes = function() {
    window.showPage('minhas-solicitacoes');
    const container = document.getElementById('lista-minhas-solicitacoes');
    if (!container) return;

    const solicitacoes = JSON.parse(localStorage.getItem('minhasSolicitacoes') || '[]');

    if (solicitacoes.length === 0) {
        container.innerHTML = `
            <div style="background: #1a0033; padding: 30px; border-radius: 10px; text-align: center; color: #b0a0c0;">
                <p>Ainda não tens nenhuma solicitação criada.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = solicitacoes.map(item => `
        <div class="order-card" style="background: #1a0033; border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span class="status" style="background: rgba(255, 170, 0, 0.2); color: #ffaa00; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${item.status}</span>
                <h3 style="margin-top: 8px; color: #fff;">${item.tipoServico} - ${item.titulo}</h3>
                <p style="color: #b0a0c0; font-size: 14px; margin-top: 4px;">📍 ${item.endereco}</p>
                <p style="color: #d0c0e0; font-size: 13px; margin-top: 4px;">📅 Data: ${item.data}</p>
            </div>
            <button class="btn btn-outline" onclick="window.mostrarToast('Detalhes da solicitação #${item.id}')">Ver Detalhes</button>
        </div>
    `).join('');
};

window.solicitarServicoCatalogo = function(nome) {
    window.showPage('request');
    setTimeout(() => {
        const select = document.getElementById('selectTipoServico');
        if (select) {
            let encontrado = false;
            for (let opt of select.options) {
                if (opt.value.toLowerCase() === nome.toLowerCase()) {
                    select.value = opt.value;
                    encontrado = true;
                    break;
                }
            }
            if (!encontrado) {
                select.value = 'Outros';
                verificarOutroServico(select);
                const inputCustom = document.getElementById('reqTipoServicoCustom');
                if (inputCustom) inputCustom.value = nome;
            }
        }
    }, 100);
};

window.filtrarCatalogoServicos = function() {
    const input = document.getElementById('inputBuscaCatalogo');
    const filtro = input ? input.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('#container-catalogo-servicos .catalog-card');
    const msgSemResultados = document.getElementById('semResultadosBusca');

    let visiveis = 0;
    cards.forEach(card => {
        const dataNome = card.getAttribute('data-nome') || '';
        const titulo = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        if (dataNome.includes(filtro) || titulo.includes(filtro)) {
            card.style.display = 'flex';
            visiveis++;
        } else {
            card.style.display = 'none';
        }
    });

    if (msgSemResultados) {
        msgSemResultados.style.display = (visiveis === 0) ? 'block' : 'none';
    }
};

window.atualizarEstadoNavbar = function() {
    const navAuthBtn = document.getElementById('nav-auth-btn');
    if (!navAuthBtn) return;
    const usuarioSalvo = localStorage.getItem('usuarioLogado');

    if (usuarioSalvo) {
        navAuthBtn.textContent = 'Sair';
        navAuthBtn.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
        navAuthBtn.style.color = '#ff4d4d';
        navAuthBtn.style.border = '1px solid #ff4d4d';
    } else {
        navAuthBtn.textContent = 'Entrar';
        navAuthBtn.style.backgroundColor = '#ffaa00';
        navAuthBtn.style.color = '#1a0033';
        navAuthBtn.style.border = 'none';
    }
};

window.tratarCliqueAuthNav = function() {
    if (localStorage.getItem('usuarioLogado')) {
        window.logout();
    } else {
        window.showPage('login');
    }
};

window.showPage = function(pageId, isBack = false) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
        if (!isBack && window.historicoPaginas[window.historicoPaginas.length - 1] !== pageId) {
            window.historicoPaginas.push(pageId);
        }
    }
    window.atualizarEstadoNavbar();
};

window.voltarTelaAnterior = function() {
    if (window.historicoPaginas.length > 1) {
        window.historicoPaginas.pop();
        window.showPage(window.historicoPaginas[window.historicoPaginas.length - 1], true);
    } else {
        window.showPage('home', true);
    }
};

window.redirecionarDashboard = function() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) {
        window.showPage('login');
        return;
    }
    try {
        const usuario = JSON.parse(usuarioSalvo);
        if (usuario.tipo === 'prestador') {
            window.showPage('dashboard-prestador');
        } else {
            window.showPage('dashboard-solicitante');
        }
    } catch (e) {
        window.showPage('login');
    }
};

window.alternarModoPerfil = function(novoModo) {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;
    let usuario = JSON.parse(usuarioSalvo);
    usuario.tipo = novoModo;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    window.redirecionarDashboard();
};

window.logout = function() {
    localStorage.removeItem('usuarioLogado');
    window.mostrarToast('Sessão encerrada');
    window.showPage('home');
};

window.alternarAbaPrestador = function(aba) {
    const abaServicos = document.getElementById('aba-prestador-servicos');
    const abaAgenda = document.getElementById('aba-prestador-agenda');
    const btnServicos = document.getElementById('btn-menu-servicos');
    const btnAgenda = document.getElementById('btn-menu-agenda');

    if (aba === 'agenda') {
        if (abaServicos) abaServicos.style.display = 'none';
        if (abaAgenda) abaAgenda.style.display = 'block';
        if (btnServicos) btnServicos.classList.remove('active');
        if (btnAgenda) btnAgenda.classList.add('active');
        window.renderizarAgenda();
    } else {
        if (abaServicos) abaServicos.style.display = 'block';
        if (abaAgenda) abaAgenda.style.display = 'none';
        if (btnServicos) btnServicos.classList.add('active');
        if (btnAgenda) btnAgenda.classList.remove('active');
    }
};

window.renderizarAgenda = function(filtro = 'todos') {
    const container = document.getElementById('container-agenda-itens');
    if (!container) return;

    let itens = window.compromissosAgenda;
    if (filtro === 'hoje') {
        itens = window.compromissosAgenda.filter(i => i.tipoData === 'hoje');
    } else if (filtro === 'proximos') {
        itens = window.compromissosAgenda.filter(i => i.tipoData === 'proximos');
    }

    if (itens.length === 0) {
        container.innerHTML = `<div style="background: #1a0033; padding: 30px; border-radius: 10px; text-align: center; color: #b0a0c0;"><p>Nenhum compromisso agendado.</p></div>`;
        return;
    }

    container.innerHTML = itens.map(item => `
        <div class="order-card">
            <div>
                <span class="status">${item.status}</span>
                <h3 style="margin-top: 8px;">${item.titulo}</h3>
                <p style="color: #b0a0c0; font-size: 14px;"><strong>Cliente:</strong> ${item.cliente} • 📍 ${item.endereco}</p>
                <p style="color: #ffaa00; font-size: 14px; font-weight: bold;">📅 ${item.dataHora} • 💰 ${item.valor}</p>
            </div>
            <button class="btn btn-primary" onclick="window.mostrarToast('Serviço concluído')">Concluir</button>
        </div>
    `).join('');
};

window.filtrarAgenda = function(filtro, el) {
    el.parentElement.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    window.renderizarAgenda(filtro);
};

window.toggleCamposPrestador = function() {
    const regTipo = document.getElementById('regTipo');
    const camposPrestador = document.getElementById('campos-prestador');
    if (regTipo && camposPrestador) {
        camposPrestador.style.display = (regTipo.value === 'prestador') ? 'grid' : 'none';
    }
};

window.carregarDadosPerfil = function() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) {
        window.showPage('login');
        return;
    }
    const usuario = JSON.parse(usuarioSalvo);
    document.getElementById('perfilNome').value = usuario.nome || '';
    document.getElementById('perfilEmail').value = usuario.email || '';
    document.getElementById('perfilTelefone').value = usuario.telefone || '';
    document.getElementById('perfilEndereco').value = usuario.endereco_completo || '';
    window.showPage('meu-perfil');
};

window.atualizarPerfil = function(event) {
    event.preventDefault();
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;
    let usuario = JSON.parse(usuarioSalvo);
    usuario.nome = document.getElementById('perfilNome').value;
    usuario.email = document.getElementById('perfilEmail').value;
    usuario.telefone = document.getElementById('perfilTelefone').value;
    usuario.endereco_completo = document.getElementById('perfilEndereco').value;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    window.mostrarToast('Perfil atualizado com sucesso!');
    window.redirecionarDashboard();
};

window.login = function(event) {
    event.preventDefault();
    const usuarioInput = document.getElementById('loginUsuario').value.trim();
    if (!usuarioInput) return;
    const usuarioMock = {
        nome: usuarioInput,
        tipo: usuarioInput.toLowerCase().includes('prestador') ? 'prestador' : 'solicitante',
        email: `${usuarioInput.toLowerCase()}@email.com`
    };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioMock));
    window.mostrarToast(`Bem-vindo(a), ${usuarioMock.nome}!`);
    window.redirecionarDashboard();
};

window.register = function(event) {
    event.preventDefault();
    const nome = document.getElementById('regNome').value;
    const tipo = document.getElementById('regTipo').value;
    const usuarioMock = {
        nome: nome,
        tipo: tipo,
        email: document.getElementById('regEmail').value,
        telefone: document.getElementById('regTelefone').value
    };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioMock));
    window.mostrarToast('Conta criada com sucesso!');
    window.redirecionarDashboard();
};

document.addEventListener('DOMContentLoaded', () => {
    // Garante a verificação correta do estado da sessão logo ao carregar a página
    window.atualizarEstadoNavbar();
    window.showPage('home');
});