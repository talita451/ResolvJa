/* ==========================================
   CONFIGURAções GLOBAIS E ESTADO INICIAL
   ========================================== */
const API_BASE_URL = 'http://localhost:3000/api';
window.historicoPaginas = ['home'];

// Dados mockados iniciais para a Agenda do Prestador
window.compromissosAgenda = [
    {
        id: 1,
        titulo: 'Instalação de Tomada 220V',
        cliente: 'Carlos Roberto',
        endereco: 'Rua Principal, 102 - Centro',
        dataHora: 'Hoje às 14:00',
        tipoData: 'hoje',
        valor: 'R$ 150,00',
        status: 'CONFIRMADO'
    }
];

/* ==========================================
   SISTEMA DE NOTIFICAÇÕES (TOAST)
   ========================================== */
window.mostrarToast = function(mensagem) {
    const toast = document.getElementById('toast-central');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2200);
};

/* ==========================================
   MÁSCARAS E INTEGRAÇÃO VIACEP
   ========================================== */
window.mascaraCep = function(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = valor;
};

window.buscarEnderecoPorCep = async function() {
    const cepInput = document.getElementById('reqCep');
    if (!cepInput) return;
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) { window.mostrarToast('CEP não encontrado.'); return; }
        document.getElementById('reqRua').value = data.logradouro || '';
        document.getElementById('reqBairro').value = data.bairro || '';
        document.getElementById('reqCidade').value = `${data.localidade} - ${data.uf}`;
        document.getElementById('reqNumero').focus();
        window.mostrarToast('Endereço carregado com sucesso!');
    } catch (e) {
        window.mostrarToast('Erro ao buscar o CEP.');
    }
};

window.buscarCepCadastro = async function() {
    const cepInput = document.getElementById('regCep');
    if (!cepInput) return;
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) { window.mostrarToast('CEP não encontrado.'); return; }
        document.getElementById('regRua').value = data.logradouro || '';
        document.getElementById('regBairro').value = data.bairro || '';
        document.getElementById('regCidade').value = `${data.localidade} - ${data.uf}`;
        document.getElementById('regNumero').focus();
        window.mostrarToast('Endereço preenchido!');
    } catch (e) {
        window.mostrarToast('Erro ao buscar CEP.');
    }
};

/* ==========================================
   CATÁLOGO DE SERVIÇOS E PESQUISA
   ========================================== */
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

window.filtrarCatalogoServicos = function() {
    const input = document.getElementById('inputBuscaCatalogo');
    const filtro = input ? input.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('#container-catalogo-servicos .catalog-card');
    const semResultados = document.getElementById('semResultadosBusca');
    let encontrados = 0;

    cards.forEach(card => {
        const dataNome = card.getAttribute('data-nome') || '';
        const titulo = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        if (dataNome.includes(filtro) || titulo.includes(filtro)) {
            card.style.display = 'flex';
            encontrados++;
        } else {
            card.style.display = 'none';
        }
    });

    if (semResultados) {
        semResultados.style.display = (encontrados === 0) ? 'block' : 'none';
    }
};

window.solicitarServicoCatalogo = function(nome) {
    window.showPage('request');
    setTimeout(() => {
        const select = document.getElementById('selectTipoServico');
        if (select) {
            select.value = nome;
            window.verificarOutroServico(select);
        }
    }, 100);
};

/* ==========================================
   SOLICITAÇÕES E GESTÃO DE PEDIDOS
   ========================================== */
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
    const endereco = `${document.getElementById('reqRua').value}, ${document.getElementById('reqNumero').value} - ${document.getElementById('reqBairro').value}, ${document.getElementById('reqCidade').value}`;

    const novaSolicitacao = {
        id: Date.now(),
        tipoServico,
        titulo,
        descricao,
        data: dataServico,
        endereco,
        status: 'DISPONÍVEL'
    };

    let solicitacoesGerais = JSON.parse(localStorage.getItem('resolvja_solicitacoes_geral') || '[]');
    solicitacoesGerais.push(novaSolicitacao);
    localStorage.setItem('resolvja_solicitacoes_geral', JSON.stringify(solicitacoesGerais));

    let minhasSol = JSON.parse(localStorage.getItem('minhasSolicitacoes') || '[]');
    minhasSol.push(novaSolicitacao);
    localStorage.setItem('minhasSolicitacoes', JSON.stringify(minhasSol));

    window.mostrarToast('Nova solicitação criada com sucesso!');
    window.carregarMinhasSolicitacoes();
};

window.carregarMinhasSolicitacoes = function() {
    window.showPage('minhas-solicitacoes');
    const container = document.getElementById('lista-minhas-solicitacoes');
    if (!container) return;

    const solicitacoes = JSON.parse(localStorage.getItem('minhasSolicitacoes') || '[]');
    if (solicitacoes.length === 0) {
        container.innerHTML = `<div class="order-card"><p>Ainda não tens nenhuma solicitação criada.</p></div>`;
        return;
    }

    container.innerHTML = solicitacoes.map(item => `
        <div class="order-card">
            <div>
                <span class="status">${item.status}</span>
                <h3 style="margin-top: 8px;">${item.tipoServico} - ${item.titulo}</h3>
                <p style="color: #b0a0c0; font-size: 14px;">📍 ${item.endereco}</p>
                <p style="color: #d0c0e0; font-size: 13px;">📅 Data: ${item.data}</p>
            </div>
        </div>
    `).join('');
};

window.carregarSolicitacoesParaPrestador = function() {
    const container = document.getElementById('container-solicitacoes-prestador');
    if (!container) return;

    const solicitacoesGerais = JSON.parse(localStorage.getItem('resolvja_solicitacoes_geral') || '[]');
    const disponiveis = solicitacoesGerais.filter(s => s.status === 'DISPONÍVEL');

    if (disponiveis.length === 0) {
        container.innerHTML = `<div class="order-card"><p>Nenhuma nova solicitação disponível no momento.</p></div>`;
        return;
    }

    container.innerHTML = disponiveis.map(item => `
        <div class="order-card">
            <div>
                <span class="status">NOVA SOLICITAÇÃO</span>
                <h3 style="margin-top: 8px;">${item.tipoServico} - ${item.titulo}</h3>
                <p style="color: #b0a0c0; font-size: 14px;">📝 ${item.descricao}</p>
                <p style="color: #b0a0c0; font-size: 13px;">📍 ${item.endereco}</p>
            </div>
            <button class="btn btn-primary" onclick="prestadorAceitarServico(${item.id})">Aceitar</button>
        </div>
    `).join('');
};

window.prestadorAceitarServico = function(idSolicitacao) {
    let solicitacoesGerais = JSON.parse(localStorage.getItem('resolvja_solicitacoes_geral') || '[]');
    solicitacoesGerais = solicitacoesGerais.map(item => {
        if (item.id === idSolicitacao) {
            item.status = 'EM ANDAMENTO';
            window.compromissosAgenda.push({
                id: item.id,
                titulo: `${item.tipoServico} - ${item.titulo}`,
                cliente: 'Cliente ResolvaJá',
                endereco: item.endereco,
                dataHora: item.data,
                tipoData: 'proximos',
                valor: 'A combinar',
                status: 'CONFIRMADO'
            });
        }
        return item;
    });
    localStorage.setItem('resolvja_solicitacoes_geral', JSON.stringify(solicitacoesGerais));
    window.mostrarToast('Serviço aceito e adicionado à agenda!');
    window.carregarSolicitacoesParaPrestador();
};

/* ==========================================
   AGENDA DO PRESTADOR
   ========================================== */
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
        container.innerHTML = `<div class="order-card"><p>Nenhum compromisso agendado para este filtro.</p></div>`;
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
            <button class="btn btn-primary" onclick="window.mostrarToast('Serviço concluído com sucesso!')">Concluir</button>
        </div>
    `).join('');
};

window.filtrarAgenda = function(filtro, el) {
    el.parentElement.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    window.renderizarAgenda(filtro);
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
        window.carregarSolicitacoesParaPrestador();
    }
};

/* ==========================================
   BUSCAR PRESTADORES DO BANCO DE DADOS
   ========================================== */
window.carregarPrestadores = async function() {
    const container = document.getElementById('container-lista-prestadores');
    if (!container) return;

    container.innerHTML = `<div class="order-card"><p>Carregando prestadores do banco de dados...</p></div>`;

    try {
        const response = await fetch(`${API_BASE_URL}/prestadores`);
        if (!response.ok) throw new Error('Erro na resposta do servidor');

        const prestadoresBanco = await response.json();

        if (!prestadoresBanco || prestadoresBanco.length === 0) {
            container.innerHTML = `<div class="order-card"><p>Nenhum prestador cadastrado no banco de dados.</p></div>`;
            return;
        }

        container.innerHTML = prestadoresBanco.map(p => `
            <div class="provider-card">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div class="avatar">${p.nome ? p.nome.charAt(0).toUpperCase() : 'P'}</div>
                    <div class="provider-info">
                        <h3>${p.nome}</h3>
                        <p style="color: #b0a0c0; font-size: 14px;">${p.profissao_funcao || 'Prestador de Serviços'}</p>
                        <p style="color: #00e676; font-weight: bold; margin-top: 4px;">A partir de R$ ${p.valor_minimo ? Number(p.valor_minimo).toFixed(2) : '80,00'}</p>
                    </div>
                </div>
                <button class="btn btn-outline" onclick="window.mostrarToast('Perfil de ${p.nome} selecionado')">Ver perfil</button>
            </div>
        `).join('');

    } catch (erro) {
        console.error('Erro ao buscar prestadores:', erro);
        container.innerHTML = `<div class="order-card" style="border-color: #ff4d4d;"><p style="color: #ff4d4d;">Erro ao conectar com o servidor Node.js/PostgreSQL.</p></div>`;
    }
};

/* ==========================================
   AUTENTICAÇÃO, NAVEGAÇÃO E PERFIS
   ========================================== */
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
    if (pageId === 'providers') {
        window.carregarPrestadores();
    }
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
    if (!usuarioSalvo) { window.showPage('login'); return; }
    try {
        const usuario = JSON.parse(usuarioSalvo);
        if (usuario.tipo === 'prestador') {
            window.showPage('dashboard-prestador');
            window.carregarSolicitacoesParaPrestador();
        } else {
            window.showPage('dashboard-solicitante');
        }
    } catch (e) {
        window.showPage('login');
    }
};

window.logout = function() {
    localStorage.removeItem('usuarioLogado');
    window.mostrarToast('Sessão encerrada');
    window.showPage('home');
};

window.alternarModoPerfil = function(novoModo) {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;
    let usuario = JSON.parse(usuarioSalvo);
    usuario.tipo = novoModo;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    window.redirecionarDashboard();
};

window.toggleCamposPrestador = function() {
    const regTipo = document.getElementById('regTipo');
    const camposPrestador = document.getElementById('campos-prestador');
    if (regTipo && camposPrestador) {
        camposPrestador.style.display = (regTipo.value === 'prestador') ? 'grid' : 'none';
    }
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

window.register = async function(event) {
    event.preventDefault();
    const nome = document.getElementById('regNome').value;
    const tipo = document.getElementById('regTipo').value;
    const email = document.getElementById('regEmail').value;
    const telefone = document.getElementById('regTelefone').value;
    const cpf = document.getElementById('regCpf').value;
    const rg = document.getElementById('regRg').value;
    const data_nascimento = document.getElementById('regNascimento').value;
    const endereco_completo = `${document.getElementById('regRua').value}, ${document.getElementById('regNumero').value} - ${document.getElementById('regBairro').value}, ${document.getElementById('regCidade').value}`;

    const usuarioMock = { nome, tipo, email, telefone };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioMock));

    if (tipo === 'prestador') {
        const dadosPrestador = {
            nome, email, cpf, rg, data_nascimento, telefone, endereco_completo,
            profissao_funcao: document.getElementById('regProfissao').value || 'Geral',
            experiencia: document.getElementById('regExperiencia').value || 'intermediário',
            possui_equipamentos: true,
            valor_minimo: parseFloat(document.getElementById('regValorMin').value) || 80.00,
            valor_maximo: parseFloat(document.getElementById('regValorMax')?.value) || 250.00,
            disponibilidade_horario: document.getElementById('regDisponibilidade').value || 'Seg a Sáb'
        };

        try {
            await fetch(`${API_BASE_URL}/prestadores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPrestador)
            });
        } catch (e) {
            console.error('Erro ao salvar prestador no banco:', e);
        }
    }

    window.mostrarToast('Conta criada com sucesso!');
    window.redirecionarDashboard();
};

window.carregarDadosPerfil = function() {
    window.showPage('meu-perfil');
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;
    try {
        const usuario = JSON.parse(usuarioSalvo);
        if (document.getElementById('perfilNome')) document.getElementById('perfilNome').value = usuario.nome || '';
        if (document.getElementById('perfilEmail')) document.getElementById('perfilEmail').value = usuario.email || '';
        if (document.getElementById('perfilTelefone')) document.getElementById('perfilTelefone').value = usuario.telefone || '';
    } catch (e) {
        console.error('Erro ao carregar perfil:', e);
    }
};

window.atualizarPerfil = function(event) {
    event.preventDefault();
    const nome = document.getElementById('perfilNome').value;
    const email = document.getElementById('perfilEmail').value;
    const telefone = document.getElementById('perfilTelefone').value;

    let usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    usuario.nome = nome;
    usuario.email = email;
    usuario.telefone = telefone;

    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    window.mostrarToast('Perfil atualizado com sucesso!');
    window.redirecionarDashboard();
};

/* ==========================================
   INICIALIZAÇÃO AO CARREGAR A PÁGINA
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    window.atualizarEstadoNavbar();
    window.showPage('home');
});