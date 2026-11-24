// ==========================================================================
// GLOBAL.JS - Configuração da API, Navegação, Navbar, Auth, Tema, CEP e UI
// Carregar PRIMEIRO em todas as páginas HTML do ResolvJá
// ==========================================================================

// CONFIGURAÇÃO DA API (MANTÉM LOCALHOST LOCALMENTE E SE ADAPTA AO PUBLICAR)
const SERVER_URL = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
)
    ? 'http://localhost:3000'
    : window.location.origin;

const API_URL = `${SERVER_URL}/ResolvJa`;

// Função auxiliar: garante que fotos salvas em /uploads carreguem tanto no localhost:3000, Live Server ou site publicado
function resolverUrlFoto(caminho) {
    if (!caminho || typeof caminho !== 'string') return '';
    const limpo = caminho.trim();
    if (!limpo) return '';
    if (limpo.startsWith('data:') || limpo.startsWith('http://') || limpo.startsWith('https://')) {
        return limpo;
    }
    if (limpo.startsWith('/')) {
        return `${SERVER_URL}${limpo}`;
    }
    return `${SERVER_URL}/${limpo}`;
}

// Mapeamento das páginas HTML separadas
const MAPA_PAGINAS = {
    'home': 'index.html',
    'catalogo-completo': 'catalogo.html',
    'sobre': 'sobre.html',
    'avaliacoes': 'avaliacoes.html',
    'sac': 'sac.html',
    'login': 'login.html',
    'register': 'cadastro.html',
    'dashboard-solicitante': 'painel-cliente.html',
    'dashboard-prestador': 'painel-prestador.html',
    'minhas-solicitacoes': 'meus-pedidos.html',
    'avaliacao': 'avaliar-servico.html',
    'avaliacao-site': 'avaliar-site.html',
    'request': 'solicitar.html',
    'providers': 'profissionais.html',
    'detalhe-prestador': 'perfil-prestador.html',
    'meu-perfil': 'meu-perfil.html',
    'atualizar-senha': 'atualizar-senha.html'
};

console.log("🛠️ Frontend ResolvJá carregado com sucesso! API:", API_URL);

// ==========================================
// 1. NAVEGAÇÃO ENTRE PÁGINAS E INTERFACE (UI)
// ==========================================
// Função: Direciona para o arquivo HTML correspondente à tela solicitada
function showPage(pageId, queryParams = '') {
    const destino = MAPA_PAGINAS[pageId] || 'index.html';
    window.location.href = queryParams ? `${destino}${queryParams}` : destino;
}

// Função: Regressa para a última página acessada no navegador
function voltarTelaAnterior() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Função: Alterna a exibição do menu dropdown do utilizador (minha conta)
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Evento Global: Fecha o dropdown se o utilizador clicar fora dele
window.onclick = function(event) {
    if (!event.target.closest('.user-menu-container')) {
        const dropdowns = document.getElementsByClassName("user-dropdown");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
};

// Função: Gerencia o estado de autenticação (logado vs deslogado) na interface Navbar
function atualizarInterfaceAuth() {
    const logado = localStorage.getItem('idUsuarioLogado');
    const btnEntrar = document.getElementById('nav-auth-btn');
    const btnPainel = document.getElementById('nav-painel-btn');
    const menuUsuario = document.getElementById('userMenuContainer');
    const avatarBtn = document.getElementById('navAvatarBtn');
    const miniFoto = document.getElementById('dropdownMiniFoto');
    const btnSerPrestador = document.getElementById('btn-quero-ser-prestador');

    if (btnSerPrestador) btnSerPrestador.style.display = logado ? 'none' : 'inline-flex';

    if (btnEntrar && menuUsuario) {
        if (logado) {
            btnEntrar.style.display = 'none';
            menuUsuario.style.display = 'inline-block';
            if (btnPainel) btnPainel.style.display = 'inline-flex'; // MOSTRA O BOTÃO MEU PAINEL

            const fotoSalva = resolverUrlFoto(localStorage.getItem('fotoUsuarioLogado'));
            if (fotoSalva && avatarBtn) {
                avatarBtn.innerHTML = `<img src="${fotoSalva}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
                if (miniFoto) miniFoto.src = fotoSalva;
            } else if (avatarBtn) {
                avatarBtn.innerHTML = `<i class="fas fa-user" id="navUserIcon"></i>`;
            }
        } else {
            btnEntrar.style.display = 'inline-flex';
            menuUsuario.style.display = 'none';
            if (btnPainel) btnPainel.style.display = 'none'; // OCULTA O BOTÃO MEU PAINEL
        }
    }

    const btnAlternar = document.getElementById('btnAlternarPerfil');
    if (btnAlternar) {
        btnAlternar.innerHTML = (localStorage.getItem('tipoUsuarioLogado') === 'solicitante')
            ? '<i class="fas fa-exchange-alt" style="color: var(--accent);"></i> Mudar para Prestador'
            : '<i class="fas fa-exchange-alt" style="color: var(--secondary);"></i> Mudar para Cliente';
    }
}

// Função: Direciona utilizador não logado para a tela de login ao clicar no botão "Entrar"
function tratarCliqueAuthNav() {
    showPage('login');
}

// Função: Redireciona o utilizador para o dashboard correto (Cliente ou Prestador)
function redirecionarDashboard() {
    const logado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado');

    if (!logado) {
        mostrarToast('Faça login primeiro!', 'erro');
        setTimeout(() => showPage('login'), 1000);
        return;
    }

    if (tipo === 'prestador') {
        showPage('dashboard-prestador');
    } else {
        showPage('dashboard-solicitante');
    }
}

// Função: Preenche a saudação com o primeiro nome do usuário no dashboard
async function carregarSaudacaoDashboard() {
    const logado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado');
    if (!logado) return;

    try {
        const endpoint = tipo === 'prestador' ? `/prestadores` : `/solicitantes`;
        const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
        const dados = await res.json();
        const usuario = dados.find(u => String(u.cod_prestador || u.id_solicitante) === String(logado));

        let primeiroNome = 'Utilizador';
        if (usuario && usuario.nome) {
            const nomeCompleto = usuario.nome.trim();
            primeiroNome = nomeCompleto.split(' ')[0];
            primeiroNome = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
        }

        const h2Prestador = document.getElementById('tituloSaudacaoPrestador');
        if (h2Prestador) h2Prestador.textContent = `Olá, ${primeiroNome} 🛠️`;

        const h2Solicitante = document.getElementById('tituloSaudacaoSolicitante');
        if (h2Solicitante) h2Solicitante.textContent = `Olá, ${primeiroNome} 👋`;
    } catch (e) {
        console.error("Erro ao carregar saudação do painel:", e);
    }
}

// Função: Realiza o Logout do sistema limpando o LocalStorage
function logout() {
    localStorage.removeItem('idUsuarioLogado');
    localStorage.removeItem('tipoUsuarioLogado');
    localStorage.removeItem('fotoUsuarioLogado');
    atualizarInterfaceAuth();
    mostrarToast('Sessão encerrada com segurança.');
    showPage('home');
}

// Função: Carrega a foto do perfil na navbar ao entrar no site
async function carregarFotoNavbarImediata() {
    const idLogado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'prestador';
    const avatarBtn = document.getElementById('navAvatarBtn');
    const miniFoto = document.getElementById('dropdownMiniFoto');

    if (!idLogado || !avatarBtn) return;

    const fotoSalva = resolverUrlFoto(localStorage.getItem('fotoUsuarioLogado'));
    if (fotoSalva) {
        avatarBtn.innerHTML = `<img src="${fotoSalva}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
        if (miniFoto) miniFoto.src = fotoSalva;
        return;
    }

    try {
        const endpoint = tipo === 'solicitante' ? `/solicitantes` : `/prestadores`;
        const resposta = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
        const dados = await resposta.json();
        const usuario = dados.find(u => String(u.cod_prestador || u.id_solicitante) === String(idLogado));

        if (usuario && usuario.foto_perfil) {
            const urlFoto = resolverUrlFoto(usuario.foto_perfil);
            localStorage.setItem('fotoUsuarioLogado', usuario.foto_perfil);
            avatarBtn.innerHTML = `<img src="${urlFoto}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
            if (miniFoto) miniFoto.src = urlFoto;
        }
    } catch (erro) {
        console.error("Erro ao carregar foto na navbar:", erro);
    }
}

// ==========================================
// 2. ALERTAS (TOAST), FOTO DE PERFIL E IMAGENS
// ==========================================
// Função: Exibe uma mensagem de alerta flutuante verde (sucesso) ou vermelha (erro)
function mostrarToast(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toast-central');
    if (!toast) return;

    toast.textContent = mensagem;
    toast.style.background = tipo === 'erro' ? '#EF4444' : '#10B981';
    toast.style.display = 'block';

    setTimeout(() => { toast.style.display = 'none'; }, 4500);
}

// Função: Converte imagens para Base64 antes do envio (o back-end salva fisicamente na pasta /uploads)
function converterImagemParaBase64(event, idInputDestino) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(uploadevento) {
        const img = new Image();
        img.src = uploadevento.target.result;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const tamanhoMaximo = 1200;
            let largura = img.width;
            let altura = img.height;

            if (largura > altura) {
                if (largura > tamanhoMaximo) {
                    altura *= tamanhoMaximo / largura;
                    largura = tamanhoMaximo;
                }
            } else {
                if (altura > tamanhoMaximo) {
                    largura *= tamanhoMaximo / altura;
                    altura = tamanhoMaximo;
                }
            }

            canvas.width = largura;
            canvas.height = altura;
            ctx.drawImage(img, 0, 0, largura, altura);

            const base64AltaQualidade = canvas.toDataURL('image/jpeg', 0.9);
            const inputDestino = document.getElementById(idInputDestino);
            if (inputDestino) inputDestino.value = base64AltaQualidade;

            mostrarToast('Imagem em alta qualidade processada com sucesso!');
        };
    };
    leitor.readAsDataURL(arquivo);
}

// Função: Fecha o modal padrão de foto, caso aberto
function fecharModalFoto() {
    const modal = document.getElementById('modalFotoPerfil');
    if (modal) modal.style.display = 'none';
}

// Função otimizada: Abre em tamanho 10x15 nítido, permite zoom ao clicar e arrastar para explorar
function ampliarFotoPerfil() {
    const imgElement = document.getElementById('dropdownMiniFoto');
    if (!imgElement || !imgElement.src) return;

    const srcOriginal = imgElement.src;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'foto-modal-overlay';
    modalOverlay.title = 'Clique fora da foto para fechar';

    const imagemAmpliada = document.createElement('img');
    imagemAmpliada.src = srcOriginal;
    imagemAmpliada.className = 'foto-modal-content';

    let comZoom = false;
    let isDragging = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;

    imagemAmpliada.style.transform = 'scale(1)';
    imagemAmpliada.style.cursor = 'zoom-in';

    imagemAmpliada.onclick = function(event) {
        event.stopPropagation();
        comZoom = !comZoom;

        if (comZoom) {
            imagemAmpliada.style.transform = `scale(2.2) translate(${translateX}px, ${translateY}px)`;
            imagemAmpliada.style.cursor = 'grab';
        } else {
            translateX = 0;
            translateY = 0;
            imagemAmpliada.style.transform = 'scale(1) translate(0px, 0px)';
            imagemAmpliada.style.cursor = 'zoom-in';
        }
    };

    imagemAmpliada.onmousedown = function(event) {
        if (!comZoom) return;
        isDragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        imagemAmpliada.style.cursor = 'grabbing';
        event.preventDefault();
    };

    window.onmousemove = function(event) {
        if (!isDragging || !comZoom) return;
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        imagemAmpliada.style.transform = `scale(2.2) translate(${translateX}px, ${translateY}px)`;
    };

    window.onmouseup = function() {
        if (isDragging) {
            isDragging = false;
            if (comZoom) imagemAmpliada.style.cursor = 'grab';
        }
    };

    modalOverlay.appendChild(imagemAmpliada);
    document.body.appendChild(modalOverlay);

    modalOverlay.onclick = function(event) {
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    };
}

// ==========================================
// 3. AUXILIARES COMPARTILHADOS DE CEP (CADASTRO E PEDIDOS)
// ==========================================
// Função: Adiciona automaticamente a formatação do CEP no input
function mascaraCep(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = v;
}

// Função: Consulta a API externa ViaCEP para autopreencher os endereços
async function buscarCepGenerico(idCep, idRua, idBairro, idCidade, idNumero) {
    const cepInput = document.getElementById(idCep);
    if (!cepInput) return;
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length === 8) {
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await res.json();
            if (!dados.erro) {
                document.getElementById(idRua).value = dados.logradouro || '';
                document.getElementById(idBairro).value = dados.bairro || '';
                document.getElementById(idCidade).value = `${dados.localidade || ''} - ${dados.uf || ''}`;
                document.getElementById(idNumero).focus();
            } else {
                mostrarToast('CEP não encontrado.', 'erro');
            }
        } catch (erro) { console.error("Erro na busca de CEP:", erro); }
    }
}

// ==========================================
// 4. ALTERNAR PERFIL (PRESENTE NA NAVBAR DE TODAS AS PÁGINAS)
// ==========================================
// Função: Transforma cliente em prestador (e vice-versa), mantendo login
async function alternarModoUsuario() {
    const idLogado = localStorage.getItem('idUsuarioLogado');
    const tipoAtual = localStorage.getItem('tipoUsuarioLogado') || 'solicitante';
    if (!idLogado) return;

    mostrarToast('A verificar os seus dados...', 'sucesso');
    const endpointAtual = tipoAtual === 'solicitante' ? '/solicitantes' : '/prestadores';
    const endpointDestino = tipoAtual === 'solicitante' ? '/prestadores' : '/solicitantes';
    const tipoDestino = tipoAtual === 'solicitante' ? 'prestador' : 'solicitante';
    const nomeDestino = tipoDestino === 'solicitante' ? 'Cliente' : 'Prestador';

    try {
        const resAtual = await fetch(`${API_URL}${endpointAtual}`, { cache: 'no-store' });
        const dadosAtual = await resAtual.json();
        const userAtual = dadosAtual.find(u => String(u.cod_prestador || u.id_solicitante) === String(idLogado));

        if (!userAtual) throw new Error("Utilizador atual não encontrado.");

        const resDestino = await fetch(`${API_URL}${endpointDestino}`, { cache: 'no-store' });
        const dadosDestino = await resDestino.json();
        const userDestino = dadosDestino.find(u => u.email.trim() === userAtual.email.trim());

        if (userDestino) {
            localStorage.setItem('idUsuarioLogado', userDestino.cod_prestador || userDestino.id_solicitante);
            localStorage.setItem('tipoUsuarioLogado', tipoDestino);

            const fotoPerfil = userDestino.foto_perfil || userAtual.foto_perfil;
            if (fotoPerfil) localStorage.setItem('fotoUsuarioLogado', fotoPerfil);
            else localStorage.removeItem('fotoUsuarioLogado');

            atualizarInterfaceAuth();
            mostrarToast(`Mudou para o modo ${nomeDestino} com sucesso!`, 'sucesso');
            redirecionarDashboard();
        } else {
            // Guarda os dados básicos na sessão para pré-preencher a página cadastro.html
            sessionStorage.setItem('dadosPreCadastro', JSON.stringify({
                tipo: tipoDestino,
                nome: userAtual.nome || '',
                email: userAtual.email || '',
                cpf: userAtual.cpf || '',
                rg: userAtual.rg || '',
                telefone: userAtual.telefone || ''
            }));
            mostrarToast(`Ainda não tem perfil de ${nomeDestino}. Preencha o que falta!`, 'sucesso');
            showPage('register', `?tipo=${tipoDestino}`);
        }
    } catch (erro) {
        mostrarToast("Erro de ligação ao tentar alternar o perfil.", "erro");
    }
}

// ==========================================
// 5. TEMA CLARO / ESCURO E INICIALIZAÇÃO GLOBAL
// ==========================================
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeIcon = document.getElementById('themeIcon');

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
}

// Inicialização global executada em todas as páginas
document.addEventListener('DOMContentLoaded', () => {
    // 1. Aplica o tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // 2. Atualiza a barra de navegação e foto do usuário
    atualizarInterfaceAuth();
    carregarFotoNavbarImediata();

    // 3. Carrega saudação nos painéis (cliente ou prestador)
    const paginaAtual = document.body.getAttribute('data-page') || '';
    if (paginaAtual === 'dashboard-solicitante' || paginaAtual === 'dashboard-prestador') {
        carregarSaudacaoDashboard();
    }
});
