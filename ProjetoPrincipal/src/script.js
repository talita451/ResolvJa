// ==========================================================================
// CONFIGURAÇÃO DA API (MANTÉM LOCALHOST LOCALMENTE E SE ADAPTA AO PUBLICAR)
// ==========================================================================
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
// 2. ALERTAS (TOAST) E COMPRESSÃO DE IMAGENS
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
// 3. AUXILIARES DE FORMULÁRIO, PAGAMENTO E VIA CEP
// ==========================================
// Função: Oculta ou mostra campos extra de cadastro dependendo de ser prestador ou cliente
function toggleCamposPrestador() {
    const selectTipo = document.getElementById('regTipo');
    if (!selectTipo) return;
    const tipo = selectTipo.value;
    const campos = document.getElementById('campos-prestador');
    if (campos) campos.style.display = tipo === 'prestador' ? 'grid' : 'none';
}

// Função: Coleta as formas de pagamento marcadas pelo prestador nos checkboxes
function obterFormasPagamentoSelecionadas(nomeGrupo) {
    const selecionadas = Array.from(document.querySelectorAll(`input[name="${nomeGrupo}"]:checked`))
        .map(el => el.value);
    return selecionadas.join(', ');
}

// Função: Marca os checkboxes de formas de pagamento ao carregar o perfil do prestador
function marcarFormasPagamento(nomeGrupo, textoSalvo) {
    if (!textoSalvo) return;
    const lista = textoSalvo.split(',').map(item => item.trim().toLowerCase());
    document.querySelectorAll(`input[name="${nomeGrupo}"]`).forEach(cb => {
        cb.checked = lista.includes(cb.value.toLowerCase());
    });
}

// Função: Exibe input customizado de serviço caso a opção "Outros" seja escolhida no select
function verificarOutroServico(select) {
    const containerNovo = document.getElementById('container-novo-servico');
    const inputCustom = document.getElementById('reqTipoServicoCustom');
    const reqDescricao = document.getElementById('reqDescricao');

    if (!containerNovo || !inputCustom || !reqDescricao) return;

    if (select.value === 'Outros') {
        containerNovo.style.display = 'flex';
        inputCustom.required = true;
        reqDescricao.required = true;
        reqDescricao.placeholder = "Explique o que precisa ser feito...";
    } else {
        containerNovo.style.display = 'none';
        inputCustom.required = false;
        reqDescricao.required = false;
        reqDescricao.placeholder = "Descreva brevemente como quer que o serviço seja feito (opcional)";
    }
}

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

// Chamadas específicas para preencher CEP no cadastro e nos pedidos
function buscarCepCadastro() { buscarCepGenerico('regCep', 'regRua', 'regBairro', 'regCidade', 'regNumero'); }
function buscarEnderecoPorCep() { buscarCepGenerico('reqCep', 'reqRua', 'reqBairro', 'reqCidade', 'reqNumero'); }

// ==========================================
// 4. AUTENTICAÇÃO E PERFIL
// ==========================================
// Função: Realiza o Cadastro de novo utilizador e envia os dados ao Back-End
async function register(event) {
    event.preventDefault();
    try {
        const senha = document.getElementById('regSenha').value;
        const senha2 = document.getElementById('regSenha2').value;
        if (senha !== senha2) return mostrarToast('As senhas não coincidem!', 'erro');

        const tipoUsuario = document.getElementById('regTipo').value;
        if (!tipoUsuario) return mostrarToast('Selecione o seu tipo de perfil.', 'erro');

        // Valida se o prestador escolheu ao menos uma forma de pagamento
        let formasPagamento = '';
        if (tipoUsuario === 'prestador') {
            formasPagamento = obterFormasPagamentoSelecionadas('regFormasPagamento');
            if (!formasPagamento) {
                return mostrarToast('Selecione pelo menos uma forma de pagamento aceita.', 'erro');
            }
        }

        const endRua = document.getElementById('regRua').value;
        const endNum = document.getElementById('regNumero').value;
        const endBairro = document.getElementById('regBairro').value;
        const endCidade = document.getElementById('regCidade').value;
        const enderecoFormatado = `${endRua}, ${endNum} - ${endBairro}, ${endCidade}`;

        // Aguarda a conversão da imagem terminar, caso o usuário tenha clicado rápido em salvar
        if (window.__promessaImagemAtual) {
            await window.__promessaImagemAtual;
        }

        let endpoint = tipoUsuario === 'solicitante' ? '/solicitantes' : '/prestadores';
        let payload = {};
        const fotoBase64 = document.getElementById('regFotoBase64') ? document.getElementById('regFotoBase64').value : '';

        if (tipoUsuario === 'solicitante') {
            payload = {
                nome: document.getElementById('regNome').value,
                cpf: document.getElementById('regCpf').value,
                rg: document.getElementById('regRg').value,
                email: document.getElementById('regEmail').value,
                data_nascimento: document.getElementById('regNascimento').value,
                telefone: document.getElementById('regTelefone').value,
                senha: senha,
                endereco: enderecoFormatado,
                estado_civil: 'Não informado'
            };
        } else {
            payload = {
                nome: document.getElementById('regNome').value,
                email: document.getElementById('regEmail').value,
                cpf: document.getElementById('regCpf').value,
                rg: document.getElementById('regRg').value,
                cnh: 'Não possui',
                sexo: 'Não informado',
                data_nascimento: document.getElementById('regNascimento').value,
                telefone: document.getElementById('regTelefone').value,
                senha: senha,
                escolaridade: 'Ensino Médio',
                endereco_completo: enderecoFormatado,
                profissao_funcao: document.getElementById('regProfissao').value,
                experiencia: document.getElementById('regExperiencia').value,
                descricao_funcoes: 'Serviços profissionais especializados.',
                possui_equipamentos: true,
                valor_minimo: Number(document.getElementById('regValorMin').value) || 50,
                valor_maximo: Number(document.getElementById('regValorMax').value) || 150,
                disponibilidade_horario: document.getElementById('regDisponibilidade').value,
                formas_pagamento: formasPagamento,
                antecedentes_criminais: "Nada consta",
                foto_perfil: fotoBase64
            };
        }

        const resposta = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await resposta.json();
        if (resposta.ok || resposta.status === 201) {
            let novoId = 1;
            let caminhoFotoSalva = '';

            if (tipoUsuario === 'solicitante' && resultado.solicitante) {
                novoId = resultado.solicitante.id_solicitante;
            } else if (tipoUsuario === 'prestador' && resultado.prestador) {
                novoId = resultado.prestador.cod_prestador;
                caminhoFotoSalva = resultado.prestador.foto_perfil || '';
            }

            localStorage.setItem('idUsuarioLogado', novoId);
            localStorage.setItem('tipoUsuarioLogado', tipoUsuario);

            // Salva o caminho da foto na pasta /uploads (e não o Base64 gigante)
            if (caminhoFotoSalva) localStorage.setItem('fotoUsuarioLogado', caminhoFotoSalva);
            else localStorage.removeItem('fotoUsuarioLogado');

            atualizarInterfaceAuth();
            mostrarToast('Cadastro realizado com sucesso!');
            document.getElementById('form-cadastro').reset();
            redirecionarDashboard();
        } else {
            mostrarToast(resultado.erro || 'Erro ao realizar cadastro.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro ao comunicar com o servidor no cadastro.', 'erro');
    }
}

// Função: Autentica o utilizador fazendo verificação via API
async function login(event) {
    event.preventDefault();
    const usuarioInput = document.getElementById('loginUsuario').value.trim();

    try {
        const resPrestador = await fetch(`${API_URL}/prestadores`, { cache: 'no-store' });
        const prestadores = await resPrestador.json();
        const prestadorEncontrado = prestadores.find(p => p.email === usuarioInput || p.nome === usuarioInput);

        if (prestadorEncontrado) {
            localStorage.setItem('idUsuarioLogado', prestadorEncontrado.cod_prestador);
            localStorage.setItem('tipoUsuarioLogado', 'prestador');
            if (prestadorEncontrado.foto_perfil) localStorage.setItem('fotoUsuarioLogado', prestadorEncontrado.foto_perfil);
            else localStorage.removeItem('fotoUsuarioLogado');

            atualizarInterfaceAuth();
            mostrarToast('Login efetuado com sucesso!');
            setTimeout(() => { redirecionarDashboard(); }, 500);
            return;
        }

        const resSolicitante = await fetch(`${API_URL}/solicitantes`, { cache: 'no-store' });
        const solicitantes = await resSolicitante.json();
        const solicitanteEncontrado = solicitantes.find(s => s.email === usuarioInput || s.nome === usuarioInput);

        if (solicitanteEncontrado) {
            localStorage.setItem('idUsuarioLogado', solicitanteEncontrado.id_solicitante);
            localStorage.setItem('tipoUsuarioLogado', 'solicitante');
            if (solicitanteEncontrado.foto_perfil) localStorage.setItem('fotoUsuarioLogado', solicitanteEncontrado.foto_perfil);
            else localStorage.removeItem('fotoUsuarioLogado');

            atualizarInterfaceAuth();
            mostrarToast('Login efetuado com sucesso!');
            setTimeout(() => { redirecionarDashboard(); }, 500);
            return;
        }

        mostrarToast('Utilizador ou senha incorretos.', 'erro');
    } catch (erro) {
        mostrarToast('Erro ao comunicar com o servidor.', 'erro');
    }
}

// Função: Navega para a página de perfil ou carrega os dados se já estiver nela
async function carregarDadosPerfil() {
    // Se não estiver na página meu-perfil.html, redireciona para ela
    if (!document.getElementById('form-perfil')) {
        showPage('meu-perfil');
        return;
    }

    let idLogado = localStorage.getItem('idUsuarioLogado');
    if (idLogado) {
        idLogado = idLogado.toString().split(':')[0].trim();
    }
    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'prestador';

    if (!idLogado) {
        mostrarToast('Faça login primeiro!', 'erro');
        setTimeout(() => showPage('login'), 1000);
        return;
    }

    try {
        const endpoint = tipo === 'solicitante' ? `/solicitantes/${idLogado}` : `/prestadores/${idLogado}`;
        const resposta = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });

        if (!resposta.ok) throw new Error('Erro ao buscar dados.');

        const usuario = await resposta.json();

        if (usuario) {
            document.getElementById('perfilNome').value = usuario.nome || '';
            document.getElementById('perfilEmail').value = usuario.email || '';
            document.getElementById('perfilTelefone').value = usuario.telefone || '';
            document.getElementById('perfilCpf').value = usuario.cpf || 'Não informado';
            document.getElementById('perfilRg').value = usuario.rg || 'Não informado';
            document.getElementById('perfilNascimento').value = usuario.data_nascimento ? usuario.data_nascimento.split('T')[0] : '';
            document.getElementById('perfilEndereco').value = usuario.endereco_completo || usuario.endereco || '';

            // Atualiza prévia da foto atual e sincroniza a navbar se houver foto salva
            if (usuario.foto_perfil) {
                const urlFoto = resolverUrlFoto(usuario.foto_perfil);
                localStorage.setItem('fotoUsuarioLogado', usuario.foto_perfil);
                atualizarInterfaceAuth();

                const imgPreview = document.getElementById('perfilFotoPreview');
                const ph = document.getElementById('perfilFotoPlaceholder');
                const inputUpload = document.getElementById('perfilFotoUpload');
                if (imgPreview && ph && (!inputUpload || !inputUpload.files || inputUpload.files.length === 0)) {
                    imgPreview.src = urlFoto;
                    imgPreview.style.display = 'block';
                    ph.style.display = 'none';
                }
            }

            const blocoProfissao = document.getElementById('bloco-perfil-profissao');
            const blocoPagamentos = document.getElementById('bloco-perfil-pagamentos');
            if (tipo === 'prestador') {
                if (blocoProfissao) blocoProfissao.style.display = 'block';
                if (blocoPagamentos) blocoPagamentos.style.display = 'block';
                document.getElementById('perfilProfissao').value = usuario.profissao_funcao || '';
                marcarFormasPagamento('perfilFormasPagamento', usuario.formas_pagamento || '');
            } else {
                if (blocoProfissao) blocoProfissao.style.display = 'none';
                if (blocoPagamentos) blocoPagamentos.style.display = 'none';
            }
        }
    } catch (erro) {
        mostrarToast('Erro ao carregar os seus dados.', 'erro');
    }
}

// Função: Envia as alterações do perfil editado de volta ao Back-End
async function atualizarPerfil(event) {
    event.preventDefault();

    let idLogado = localStorage.getItem('idUsuarioLogado');
    if (idLogado) {
        idLogado = idLogado.toString().split(':')[0].trim();
    }

    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'solicitante';

    if (!idLogado) {
        mostrarToast('Sessão expirada. Faça login novamente.', 'erro');
        showPage('login');
        return;
    }

    // Aguarda a conversão da imagem terminar, caso o usuário tenha clicado rápido em Salvar
    if (window.__promessaImagemAtual) {
        await window.__promessaImagemAtual;
    }

    // Garantia extra: se há arquivo selecionado mas o campo oculto ainda não recebeu o valor, lê agora
    const inputUpload = document.getElementById('perfilFotoUpload');
    const campoBase64 = document.getElementById('perfilFotoBase64');
    if (inputUpload && inputUpload.files && inputUpload.files[0] && campoBase64 && !campoBase64.value) {
        await converterImagemParaBase64({ target: inputUpload }, 'perfilFotoBase64');
    }

    const fotoNovaBase64 = campoBase64 ? campoBase64.value : '';
    let payload = {};
    let endpointServidor = '';

    if (tipo === 'solicitante') {
        endpointServidor = `${API_URL}/solicitantes/${idLogado}`;
        payload = {
            nome: document.getElementById('perfilNome').value,
            email: document.getElementById('perfilEmail').value,
            telefone: document.getElementById('perfilTelefone').value,
            endereco: document.getElementById('perfilEndereco').value,
            foto_perfil: fotoNovaBase64 || undefined
        };
    } else {
        const formasPagamento = obterFormasPagamentoSelecionadas('perfilFormasPagamento');
        endpointServidor = `${API_URL}/prestadores/${idLogado}`;
        payload = {
            nome: document.getElementById('perfilNome').value,
            email: document.getElementById('perfilEmail').value,
            telefone: document.getElementById('perfilTelefone').value,
            endereco_completo: document.getElementById('perfilEndereco').value,
            profissao_funcao: document.getElementById('perfilProfissao') ? document.getElementById('perfilProfissao').value : null,
            formas_pagamento: formasPagamento || undefined,
            foto_perfil: fotoNovaBase64 || undefined
        };
    }

    try {
        const resposta = await fetch(endpointServidor, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await resposta.json();
        if (resposta.ok && !resultado.erro && !resultado.error) {
            // Atualiza o caminho salvo na pasta /uploads retornado pelo servidor (para prestador OU cliente)
            const fotoRetornada = (resultado.prestador && resultado.prestador.foto_perfil)
                || (resultado.solicitante && resultado.solicitante.foto_perfil)
                || '';

            if (fotoRetornada) {
                localStorage.setItem('fotoUsuarioLogado', fotoRetornada);
            }
            mostrarToast('Dados atualizados com sucesso!', 'sucesso');
            atualizarInterfaceAuth();
            setTimeout(() => redirecionarDashboard(), 1000);
        } else {
            mostrarToast(resultado.erro || resultado.error || 'Erro ao atualizar dados.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// ==========================================
// 5. PEDIDOS, CONFIRMAÇÃO, RECUSA E AGENDA
// ==========================================
// Função: Redireciona o utilizador para a página solicitar.html com o serviço escolhido
function solicitarServicoCatalogo(nomeServico, codPrestador = null) {
    const params = new URLSearchParams();
    if (nomeServico) params.set('servico', nomeServico);
    if (codPrestador) params.set('prestador', codPrestador);
    const qs = params.toString() ? `?${params.toString()}` : '';
    showPage('request', qs);
}

// Função: Inicializa os campos da página solicitar.html (categorias e auto-preenchimento de endereço)
async function inicializarPaginaSolicitar() {
    const select = document.getElementById('selectTipoServico');
    const params = new URLSearchParams(window.location.search);
    const nomeServicoUrl = params.get('servico') || '';
    const prestadorUrl = params.get('prestador') || '';

    const campoPrestador = document.getElementById('reqCodPrestadorDireto');
    if (campoPrestador && prestadorUrl) {
        campoPrestador.value = prestadorUrl;
    }

    if (select) {
        try {
            const res = await fetch(`${API_URL}/servicos`, { cache: 'no-store' });
            const tipos = await res.json();
            if (Array.isArray(tipos) && tipos.length > 0) {
                select.innerHTML = `<option value="" disabled selected>Selecione o serviço...</option>` +
                    tipos.map(t => `<option value="${t.nome}" data-id="${t.id_tipo_servico}">${t.nome}</option>`).join('') +
                    `<option value="Outros">Outro Serviço (Especificar)</option>`;
            }
        } catch (e) {
            console.log("Mantendo opções padrão.");
        }

        if (nomeServicoUrl) {
            const existeOpcao = Array.from(select.options).some(opt => opt.value.toLowerCase() === nomeServicoUrl.toLowerCase());
            if (existeOpcao) {
                const optEncontrada = Array.from(select.options).find(opt => opt.value.toLowerCase() === nomeServicoUrl.toLowerCase());
                select.value = optEncontrada.value;
            } else {
                select.value = 'Outros';
                const customInput = document.getElementById('reqTipoServicoCustom');
                if (customInput) customInput.value = nomeServicoUrl;
            }
            verificarOutroServico(select);
        }
    }

    const idLogado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'prestador';

    if (idLogado) {
        try {
            const endpoint = tipo === 'solicitante' ? `/solicitantes` : `/prestadores`;
            const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
            const dados = await res.json();
            const user = dados.find(u => String(u.cod_prestador || u.id_solicitante) === String(idLogado));

            if (user && (user.endereco_completo || user.endereco)) {
                const morada = user.endereco_completo || user.endereco;
                const cepMatch = morada.match(/(\d{5}-\d{3}|\d{8})/);
                if (cepMatch) {
                    document.getElementById('reqCep').value = cepMatch[0];
                    buscarEnderecoPorCep();
                }
                const numMatch = morada.match(/,\s*([^-\s]+)/);
                if (numMatch && numMatch[1]) {
                    document.getElementById('reqNumero').value = numMatch[1];
                }
            }
        } catch (e) {
            console.error("Erro no auto-preenchimento", e);
        }
    }
}

// Função: Submete um pedido de novo serviço no sistema
async function submitRequest(event) {
    event.preventDefault();
    const idLogado = localStorage.getItem('idUsuarioLogado');
    if (!idLogado) {
        mostrarToast('Faça login para solicitar um serviço.', 'erro');
        return;
    }

    const selectEl = document.getElementById('selectTipoServico');
    let tipoServico = selectEl.value;

    let idTipoServico = 1;
    if (selectEl.selectedOptions && selectEl.selectedOptions[0]) {
        const dataId = selectEl.selectedOptions[0].getAttribute('data-id');
        if (dataId) idTipoServico = Number(dataId);
    }

    if (tipoServico === 'Outros') {
        tipoServico = document.getElementById('reqTipoServicoCustom').value;
    }

    const endRua = document.getElementById('reqRua').value;
    const endNum = document.getElementById('reqNumero').value;
    const endBairro = document.getElementById('reqBairro').value;
    const endCidade = document.getElementById('reqCidade').value;
    const enderecoFormatado = `${endRua}, ${endNum} - ${endBairro}, ${endCidade}`;

    const hInicio = document.getElementById('reqHoraInicio').value;
    const hFim = document.getElementById('reqHoraFim').value;
    const intervaloHorario = `${hInicio} às ${hFim}`;

    // Se o cliente veio diretamente do perfil de um prestador, envia o código dele; senão fica aberto nas Oportunidades
    const campoPrestadorDireto = document.getElementById('reqCodPrestadorDireto');
    const codPrestadorAtribuido = (campoPrestadorDireto && campoPrestadorDireto.value)
        ? Number(campoPrestadorDireto.value)
        : null;

    const descExtra = document.getElementById('reqDescricao').value;
    const titulo = document.getElementById('reqTitulo').value;
    const descricaoFinal = descExtra ? `[${tipoServico}] ${titulo} - ${descExtra}` : `[${tipoServico}] ${titulo}`;

    const payload = {
        id_solicitante: Number(idLogado),
        id_tipo_servico: idTipoServico,
        cod_prestador: codPrestadorAtribuido,
        data_servico: document.getElementById('reqData').value,
        horario: intervaloHorario,
        endereco: enderecoFormatado,
        descricao: descricaoFinal,
        valor_combinado: 0
    };

    try {
        const resposta = await fetch(`${API_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await resposta.json();
        if (resposta.ok && !resultado.erro && !resultado.error) {
            mostrarToast('Serviço solicitado com sucesso!');
            event.target.reset();
            showPage('minhas-solicitacoes');
        } else {
            mostrarToast(resultado.erro || resultado.error || 'Erro ao gravar na Base de Dados.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de ligação com o servidor.', 'erro');
    }
}

// ----------------------------------------------------
// CONFIRMAÇÃO E RECUSA/CANCELAMENTO PELO SOLICITANTE
// ----------------------------------------------------
// Função: Solicitante confirma o serviço após o prestador aceitar
async function confirmarSolicitacaoCliente(idSolicitacao) {
    try {
        const resposta = await fetch(`${API_URL}/solicitacoes/${idSolicitacao}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Confirmado pelo cliente' })
        });

        if (resposta.ok) {
            mostrarToast('Serviço confirmado! O prestador já foi avisado.', 'sucesso');
            carregarMinhasSolicitacoes();
        } else {
            mostrarToast('Erro ao confirmar o serviço.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// Função: Solicitante cancela/recusa a solicitação aceita pelo prestador
// Mantém o cod_prestador para que o prestador receba a mensagem de que o cliente recusou/cancelou
async function recusarSolicitacaoCliente(idSolicitacao) {
    try {
        const resposta = await fetch(`${API_URL}/solicitacoes/${idSolicitacao}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelado/Recusado pelo cliente' })
        });

        if (resposta.ok) {
            // Abre logo em seguida a opção "Solicitar serviço novamente?"
            abrirModalSolicitarNovamente();
        } else {
            mostrarToast('Erro ao cancelar/recusar o pedido.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// Função: Exibe o modal perguntando "Solicitar serviço novamente?"
function abrirModalSolicitarNovamente() {
    const modal = document.getElementById('modalSolicitarNovamente');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Fallback caso a página não tenha o elemento modal
        if (confirm('Pedido cancelado. Solicitar serviço novamente?')) {
            showPage('request');
        } else {
            carregarMinhasSolicitacoes();
        }
    }
}

// Função: Trata a resposta Sim/Não do modal "Solicitar serviço novamente?"
function responderSolicitarNovamente(desejaSolicitar) {
    const modal = document.getElementById('modalSolicitarNovamente');
    if (modal) modal.style.display = 'none';

    if (desejaSolicitar) {
        // Se respondeu SIM, abre a tela de solicitação
        showPage('request');
    } else {
        // Se respondeu NÃO, apenas atualiza a lista de pedidos
        carregarMinhasSolicitacoes();
    }
}

// ----------------------------------------------------
// FLUXO DE AVALIAÇÃO COM ESTRELAS E FOTO (CLIENTE)
// ----------------------------------------------------
// Função: Redireciona para a página de avaliação do profissional
function abrirTelaAvaliacao(idSolicitacao) {
    showPage('avaliacao', `?id=${encodeURIComponent(idSolicitacao)}`);
}

// Função: Aplica animação das estrelas selecionadas visualmente
function selecionarEstrela(nota, containerId, inputId) {
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = nota;
    const stars = document.querySelectorAll(`#${containerId} span`);

    stars.forEach((star, index) => {
        if (index < nota) {
            star.style.color = '#F59E0B';
        } else {
            star.style.color = '#ccc';
        }
    });
}

// Função: Submete a avaliação e nota do profissional via PUT ao Banco
async function enviarAvaliacao(event) {
    event.preventDefault();
    const idSolicitacao = document.getElementById('idSolicitacaoAvaliacao').value;
    const nota = document.getElementById('notaAvaliacao').value;
    const comentario = document.getElementById('comentarioAvaliacao').value;
    const fotoAvaliacao = document.getElementById('fotoAvaliacaoBase64').value;

    if (nota == 0) {
        return mostrarToast('Por favor, selecione pelo menos 1 estrela para avaliar.', 'erro');
    }

    const novoStatus = `Finalizado e Avaliado`;

    try {
        const resposta = await fetch(`${API_URL}/solicitacoes/${idSolicitacao}/avaliar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: novoStatus,
                nota: Number(nota),
                comentario: comentario,
                foto_avaliacao: fotoAvaliacao
            })
        });

        if (resposta.ok) {
            mostrarToast('Avaliação do profissional enviada! Gostaríamos da sua opinião sobre o site.', 'sucesso');
            showPage('avaliacao-site');
        } else {
            mostrarToast('Erro ao gravar avaliação no sistema.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// ----------------------------------------------------
// AVALIAÇÃO DO SITE (PLATAFORMA)
// ----------------------------------------------------
// Função: Envia feedback geral sobre a plataforma ResolvJá
async function enviarAvaliacaoSite(event) {
    event.preventDefault();
    const nota = document.getElementById('notaAvaliacaoSite').value;
    const comentario = document.getElementById('comentarioAvaliacaoSite').value;
    const idLogado = localStorage.getItem('idUsuarioLogado');
    const tipoLogado = localStorage.getItem('tipoUsuarioLogado');

    if (nota == 0) {
        return mostrarToast('Por favor, selecione pelo menos 1 estrela para o site.', 'erro');
    }

    try {
        let nomeUsuario = "Usuário";
        if (idLogado) {
            const endpoint = tipoLogado === 'prestador' ? '/prestadores' : '/solicitantes';
            const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
            const usuarios = await res.json();
            const user = usuarios.find(u => String(u.cod_prestador || u.id_solicitante) === String(idLogado));
            if (user) nomeUsuario = user.nome;
        }

        const payload = {
            id_usuario: idLogado || null,
            nome_usuario: nomeUsuario,
            nota: Number(nota),
            comentario: comentario
        };

        const resposta = await fetch(`${API_URL}/avaliacoes-site`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            mostrarToast('Avaliação do site publicada com sucesso! Obrigado.', 'sucesso');
            document.getElementById('form-avaliacao-site').reset();
            selecionarEstrela(0, 'star-rating-site', 'notaAvaliacaoSite');
            showPage('home');
        } else {
            mostrarToast('Erro ao enviar avaliação do site.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// Função: Navega para avaliacoes.html ou carrega os depoimentos se já estiver nela
async function abrirTelaAvaliacoesSite() {
    const container = document.getElementById('lista-avaliacoes-site');
    if (!container) {
        showPage('avaliacoes');
        return;
    }

    container.innerHTML = '<p style="text-align:center; color: var(--text-muted);">A carregar depoimentos...</p>';

    // Avaliações fictícias para dar credibilidade à página (5 estrelas)
    const avaliacoesMock = [
        { nota: 5, comentario: "Plataforma excelente! Encontrei um eletricista em 10 minutos para trocar o meu chuveiro. Muito prático.", nome_usuario: "Mariana Silva" },
        { nota: 5, comentario: "Segurança e rapidez. O profissional foi super educado, fez o reparo no encanamento e o preço foi muito justo.", nome_usuario: "Carlos Eduardo" },
        { nota: 5, comentario: "Gostei muito da facilidade de ver as avaliações antes de contratar. Fiquei muito mais tranquila ao chamar o prestador.", nome_usuario: "Fernanda Costa" },
        { nota: 5, comentario: "Instalaram meu varal de teto perfeitamente. O site é muito fácil de usar até para quem não tem familiaridade com tecnologia.", nome_usuario: "Roberto Alves" }
    ];

    try {
        const resposta = await fetch(`${API_URL}/avaliacoes-site`, { cache: 'no-store' });
        let avaliacoesReais = [];
        if (resposta.ok) {
            avaliacoesReais = await resposta.json();
        }

        const todasAvaliacoes = [...avaliacoesReais, ...avaliacoesMock];

        if (todasAvaliacoes.length > 0) {
            container.innerHTML = todasAvaliacoes.map(av => {
                const estrelasHTML = '⭐'.repeat(av.nota);
                return `
                    <div style="background: #fff; border: 1px solid var(--border); padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                        <div style="font-size: 20px; margin-bottom: 10px;">${estrelasHTML}</div>
                        <p style="font-size: 16px; color: var(--text-main); font-style: italic; margin-bottom: 15px;">"${av.comentario}"</p>
                        <h4 style="color: var(--primary); border-top: 1px solid var(--border); padding-top: 15px; font-size: 15px;">- ${av.nome_usuario}</h4>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p style="text-align:center; color: var(--text-muted);">Ainda não há avaliações sobre a plataforma.</p>';
        }
    } catch (e) {
        container.innerHTML = avaliacoesMock.map(av => {
            const estrelasHTML = '⭐'.repeat(av.nota);
            return `
                <div style="background: #fff; border: 1px solid var(--border); padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                    <div style="font-size: 20px; margin-bottom: 10px;">${estrelasHTML}</div>
                    <p style="font-size: 16px; color: var(--text-main); font-style: italic; margin-bottom: 15px;">"${av.comentario}"</p>
                    <h4 style="color: var(--primary); border-top: 1px solid var(--border); padding-top: 15px; font-size: 15px;">- ${av.nome_usuario}</h4>
                </div>
            `;
        }).join('');
    }
}

// ----------------------------------------------------
// ATUALIZAÇÃO GERAL DE STATUS E LISTAGENS DE DASHBOARD
// ----------------------------------------------------
// Função: Centraliza a alteração do status (ex: "A caminho", "Concluído", "Cancelado (Ciente)")
async function atualizarStatusServico(idSolicitacao, novoStatus, mensagemSucesso) {
    try {
        const resposta = await fetch(`${API_URL}/solicitacoes/${idSolicitacao}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        if (resposta.ok) {
            mostrarToast(mensagemSucesso, 'sucesso');
            const tipo = localStorage.getItem('tipoUsuarioLogado');
            if (tipo === 'prestador') {
                carregarAgendaPrestador();
            } else {
                carregarMinhasSolicitacoes();
            }
        } else {
            mostrarToast('Erro ao atualizar o status do pedido.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// Função: Busca ordens de serviço apenas do Cliente e atualiza painel
async function carregarMinhasSolicitacoes() {
    const lista = document.getElementById('lista-minhas-solicitacoes');
    if (!lista) {
        showPage('minhas-solicitacoes');
        return;
    }

    lista.innerHTML = '<p style="color: var(--text-muted);">A carregar os seus pedidos...</p>';
    const idLogado = localStorage.getItem('idUsuarioLogado');

    if (!idLogado) {
        lista.innerHTML = '<p style="color: var(--error);">Faça login para ver os seus pedidos.</p>';
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/solicitantes/${idLogado}/solicitacoes`, { cache: 'no-store' });
        let dados = await resposta.json();

        if (dados && !Array.isArray(dados)) {
            dados = dados.solicitacoes || dados.dados || Object.values(dados);
        }

        if (resposta.ok && Array.isArray(dados) && dados.length > 0) {
            lista.innerHTML = dados.map(sol => {
                const idPed = sol.id_solicitacao || sol.id || 'N/D';
                const dataPed = sol.data_servico ? sol.data_servico.split('T')[0] : 'Data não informada';
                const horarioPed = sol.horario || 'Horário não informado';
                const enderecoPed = sol.endereco || 'Endereço não informado';
                const descricaoPed = sol.descricao || 'Sem descrição';
                const statusPed = sol.status || 'Pendente';
                const statusLower = statusPed.toLowerCase();

                // Informações extras do prestador quando já houver um vinculado
                let infoPrestadorHtml = '';
                if (sol.prestador_nome) {
                    infoPrestadorHtml = `
                        <p style="margin-bottom: 5px;"><strong>Profissional:</strong> ${sol.prestador_nome}${sol.prestador_telefone ? ` (${sol.prestador_telefone})` : ''}</p>
                        ${sol.prestador_formas_pagamento ? `<p style="margin-bottom: 5px;"><strong>Formas de Pagamento Aceitas:</strong> ${sol.prestador_formas_pagamento}</p>` : ''}
                    `;
                }

                // Cor da etiqueta de status
                let corStatus = 'var(--success)';
                let bgStatus = 'rgba(16, 185, 129, 0.1)';
                if (statusLower.includes('cancelado') || statusLower.includes('recusado')) {
                    corStatus = 'var(--error)';
                    bgStatus = 'rgba(239, 68, 68, 0.12)';
                } else if (statusLower.includes('aceito')) {
                    corStatus = 'var(--accent)';
                    bgStatus = 'rgba(249, 115, 22, 0.12)';
                }

                // Botões de ação para o cliente conforme o status do pedido
                let acaoCliente = '';
                if (statusLower.includes('aceito')) {
                    // Quando o prestador aceita, exibe botão CONFIRMAR e botão CANCELAR / RECUSAR
                    acaoCliente = `
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-primary btn-sm" onclick="confirmarSolicitacaoCliente('${idPed}')" style="background-color: var(--success); border: none; flex: 1;">
                                <i class="fas fa-check"></i> Confirmar Serviço
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="recusarSolicitacaoCliente('${idPed}')" style="background-color: var(--error); border: none; flex: 1;">
                                <i class="fas fa-times"></i> Cancelar / Recusar
                            </button>
                        </div>
                    `;
                } else if (statusLower === 'pendente' || statusLower.includes('confirmado')) {
                    acaoCliente = `
                        <div style="margin-top: 15px;">
                            <button class="btn btn-primary btn-sm" onclick="recusarSolicitacaoCliente('${idPed}')" style="background-color: var(--error); border: none; width: 100%;">
                                <i class="fas fa-times"></i> Cancelar Pedido
                            </button>
                        </div>
                    `;
                } else if (statusLower === 'concluído') {
                    acaoCliente = `<button class="btn btn-primary btn-sm" onclick="abrirTelaAvaliacao('${idPed}')" style="margin-top: 15px; background-color: #F59E0B; width: 100%; border: none;">Deixar Avaliação ⭐</button>`;
                } else if (statusLower.includes('cancelado') || statusLower.includes('recusado')) {
                    acaoCliente = `<button class="btn btn-secondary btn-sm" onclick="showPage('request')" style="margin-top: 15px; width: 100%;"><i class="fas fa-redo"></i> Solicitar Serviço Novamente</button>`;
                }

                return `
                    <div style="background: var(--surface); border: 1px solid var(--border); border-left: 5px solid var(--primary); padding: 25px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px;">Pedido #${idPed}</h3>
                        <p style="margin-bottom: 5px;"><strong>Data Pretendida:</strong> ${dataPed} (${horarioPed})</p>
                        <p style="margin-bottom: 5px;"><strong>Endereço:</strong> ${enderecoPed}</p>
                        <p style="margin-bottom: 5px;"><strong>Descrição:</strong> ${descricaoPed}</p>
                        ${infoPrestadorHtml}
                        <p style="margin-top: 10px;">Status: <span style="color: ${corStatus}; font-weight: bold; background: ${bgStatus}; padding: 4px 10px; border-radius: 20px;">${statusPed}</span></p>
                        <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;"><i class="fas fa-info-circle"></i> Valor final sujeito a alterações de acordo com o serviço prestado.</p>
                        ${acaoCliente}
                    </div>
                `;
            }).join('');
        } else {
            lista.innerHTML = '<p style="color: var(--text-muted);">Ainda não tem pedidos registados.</p>';
        }
    } catch (erro) {
        lista.innerHTML = '<p style="color: var(--error);">Ocorreu um erro ao buscar os seus pedidos.</p>';
    }
}

// Função: Traz os serviços pendentes globais que não possuem prestador (Oportunidades)
async function carregarOportunidadesPrestador() {
    const conteudo = document.getElementById('conteudoDinamicoPrestador');
    if (!conteudo) {
        showPage('dashboard-prestador', '?aba=oportunidades');
        return;
    }
    conteudo.innerHTML = '<p style="color: var(--text-muted);">A procurar oportunidades disponíveis...</p>';

    try {
        const res = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
        let solicitacoes = await res.json();

        if (solicitacoes && !Array.isArray(solicitacoes)) {
            solicitacoes = solicitacoes.solicitacoes || solicitacoes.dados || Object.values(solicitacoes);
        }

        const idPrestador = localStorage.getItem('idUsuarioLogado');
        const disponiveis = solicitacoes.filter(s =>
            (!s.cod_prestador || String(s.cod_prestador) === String(idPrestador)) &&
            (!s.status || s.status.toLowerCase() === 'pendente')
        );

        if (Array.isArray(disponiveis) && disponiveis.length > 0) {
            conteudo.innerHTML = `
                <h3 style="color: var(--primary); margin-bottom: 15px;">Oportunidades na Região 💼</h3>
                ${disponiveis.map(s => {
                    const idPed = s.id_solicitacao || s.id;
                    const dataPed = s.data_servico ? s.data_servico.split('T')[0] : 'Data não informada';
                    return `
                        <div style="background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid var(--accent);">
                            <p><strong>Cliente:</strong> ${s.solicitante_nome || 'Cliente ResolvJá'}</p>
                            <p><strong>Data Desejada:</strong> ${dataPed} (${s.horario || ''})</p>
                            <p><strong>Local:</strong> ${s.endereco}</p>
                            <p><strong>Serviço:</strong> ${s.descricao}</p>
                            <button class="btn btn-primary btn-sm" style="margin-top: 10px;" onclick="aceitarSolicitudeUber('${idPed}')">Aceitar Solicitação</button>
                        </div>
                    `;
                }).join('')}
            `;
        } else {
            conteudo.innerHTML = '<p style="color: var(--text-muted);">De momento não existem novas oportunidades abertas.</p>';
        }
    } catch (e) {
        conteudo.innerHTML = '<p style="color: var(--error);">Erro ao carregar oportunidades.</p>';
    }
}

// Função: Associa um pedido não reivindicado ao prestador que clicou em Aceitar
async function aceitarSolicitudeUber(idSolicitacao) {
    const idPrestador = localStorage.getItem('idUsuarioLogado');
    if (!idPrestador) {
        mostrarToast('Faça login como prestador!', 'erro');
        return;
    }

    try {
        const resPrestadores = await fetch(`${API_URL}/prestadores`, { cache: 'no-store' });
        const prestadores = await resPrestadores.json();
        const prestadorLogado = prestadores.find(p => String(p.cod_prestador) === String(idPrestador));
        const nomePrestador = prestadorLogado ? prestadorLogado.nome : 'Profissional';

        const resposta = await fetch(`${API_URL}/solicitacoes/${idSolicitacao}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cod_prestador: Number(idPrestador),
                status: `Aceito pelo prestador ${nomePrestador}`
            })
        });

        if (resposta.ok) {
            mostrarToast('Serviço aceito com sucesso! Aguardando confirmação do cliente na sua agenda.');
            carregarAgendaPrestador();
        } else {
            const erroJson = await resposta.json();
            mostrarToast(erroJson.erro || 'Erro ao aceitar a solicitação.', 'erro');
        }
    } catch (e) {
        mostrarToast('Erro de ligação com o servidor.', 'erro');
    }
}

// Função: Busca as ordens ativas e notificações de cancelamento/recusa vinculadas ao prestador (Agenda)
async function carregarAgendaPrestador() {
    const conteudo = document.getElementById('conteudoDinamicoPrestador');
    if (!conteudo) {
        showPage('dashboard-prestador', '?aba=agenda');
        return;
    }
    conteudo.innerHTML = '<p style="color: var(--text-muted);">A carregar a sua agenda de serviços...</p>';

    const idPrestador = localStorage.getItem('idUsuarioLogado');
    try {
        const res = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
        let solicitacoes = await res.json();

        if (solicitacoes && !Array.isArray(solicitacoes)) {
            solicitacoes = solicitacoes.solicitacoes || solicitacoes.dados || Object.values(solicitacoes);
        }

        // Mantém visíveis na agenda os serviços aceitos, confirmados, a caminho e os recusados/cancelados pelo cliente (até o prestador marcar como ciente)
        const minhasSolicitacoes = solicitacoes.filter(s => {
            const st = (s.status || '').toLowerCase();
            return String(s.cod_prestador) === String(idPrestador) &&
                !st.includes('avaliado') &&
                st !== 'concluído' &&
                st !== 'cancelado (ciente)' &&
                st !== 'pendente';
        });

        if (Array.isArray(minhasSolicitacoes) && minhasSolicitacoes.length > 0) {
            conteudo.innerHTML = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: var(--primary); font-size: 22px; margin-bottom: 5px;">Minha Agenda Profissional 📅</h3>
                    <p style="color: var(--text-muted); font-size: 14px;">Compromissos aceitos, confirmados pelo solicitante, cancelados ou a caminho.</p>
                </div>
                <div style="display: grid; gap: 20px;">
                ${minhasSolicitacoes.map(s => {
                    const dataPed = s.data_servico ? s.data_servico.split('T')[0] : 'Data não informada';
                    const servicoNome = s.servico || s.descricao || 'Serviço ResolvJá';
                    const statusAtual = (s.status || 'Pendente').toLowerCase();

                    const ehCancelado = statusAtual.includes('cancelado') || statusAtual.includes('recusado');
                    const corBorda = ehCancelado ? 'var(--error)' : 'var(--accent)';
                    const corBadge = ehCancelado ? 'var(--error)' : 'var(--success)';
                    const bgBadge = ehCancelado ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';

                    let avisoCancelamento = '';
                    let botoesAcao = '';

                    if (ehCancelado) {
                        // Mensagem explícita ao prestador informando que o cliente recusou/cancelou o pedido
                        avisoCancelamento = `
                            <div style="margin-top: 12px; padding: 12px 14px; border-radius: 8px; border: 1px solid var(--error); background: rgba(239, 68, 68, 0.08); color: var(--error); font-weight: 600; font-size: 14px;">
                                <i class="fas fa-exclamation-triangle"></i> Pedido cancelado: o solicitante recusou/cancelou esta solicitação.
                            </div>
                        `;
                        botoesAcao = `
                            <button class="btn btn-primary btn-sm" onclick="atualizarStatusServico('${s.id_solicitacao}', 'Cancelado (Ciente)', 'Aviso de cancelamento arquivado.')" style="margin-top: 12px; background-color: var(--text-muted); width: 100%; border: none;">
                                Ciente / Remover da Agenda
                            </button>
                        `;
                    } else if (statusAtual.includes('aceito')) {
                        botoesAcao = `
                            <div style="margin-top: 12px; padding: 10px; border-radius: 8px; border: 1px dashed var(--accent); font-size: 13px; color: var(--text-muted); text-align: center;">
                                <i class="fas fa-hourglass-half" style="color: var(--accent);"></i> Aguardando o solicitante confirmar ou recusar o atendimento.
                            </div>
                        `;
                    } else if (statusAtual.includes('confirmado')) {
                        botoesAcao = `<button class="btn btn-secondary btn-sm" onclick="atualizarStatusServico('${s.id_solicitacao}', 'A caminho', '🚗 Cliente notificado que você está a caminho!')" style="margin-top: 15px; width: 100%;">Marcar como "Estou a Caminho"</button>`;
                    } else if (statusAtual === 'a caminho') {
                        botoesAcao = `<button class="btn btn-primary btn-sm" onclick="atualizarStatusServico('${s.id_solicitacao}', 'Concluído', '✅ Serviço marcado como concluído! Ele será movido para os concluídos após a avaliação.')" style="margin-top: 15px; background-color: var(--success); width: 100%; border: none;">Concluir Serviço</button>`;
                    }

                    return `
                        <div style="background: var(--surface); border: 1px solid var(--border); border-left: 5px solid ${corBorda}; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
                                <h4 style="color: var(--primary); font-size: 18px; margin: 0;"><i class="fas fa-tools" style="color: ${corBorda}; margin-right: 8px;"></i>${servicoNome}</h4>
                                <span style="background: ${bgBadge}; color: ${corBadge}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${s.status}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; font-size: 14px; color: var(--text-main);">
                                <div><strong><i class="fas fa-user" style="color: var(--primary); margin-right: 6px;"></i>Cliente:</strong> ${s.solicitante_nome || 'Cliente ResolvJá'}</div>
                                <div><strong><i class="fas fa-clock" style="color: var(--secondary); margin-right: 6px;"></i>Horário:</strong> ${s.horario || 'A combinar'} (${dataPed})</div>
                                <div style="grid-column: 1 / -1;"><strong><i class="fas fa-map-marker-alt" style="color: var(--accent); margin-right: 6px;"></i>Endereço Completo:</strong> ${s.endereco || 'Endereço não informado'}</div>
                            </div>
                            ${avisoCancelamento}
                            ${botoesAcao}
                        </div>
                    `;
                }).join('')}
                </div>
            `;
        } else {
            conteudo.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-calendar-times" style="font-size: 48px; color: var(--accent); margin-bottom: 15px;"></i>
                    <h3>Nenhum serviço pendente na agenda</h3>
                    <p>Verifique as oportunidades ou a aba de Concluídos.</p>
                </div>
            `;
        }
    } catch (e) {
        conteudo.innerHTML = '<p style="color: var(--error);">Erro ao carregar a agenda.</p>';
    }
}

// ==========================================
// RESPOSTA DO PRESTADOR À AVALIAÇÃO
// ==========================================
async function enviarRespostaAvaliacao(idSolicitacao) {
    const input = document.getElementById(`input-resp-${idSolicitacao}`);
    const resposta = input ? input.value.trim() : '';

    if (!resposta) {
        return mostrarToast('Digite uma resposta antes de enviar.', 'erro');
    }

    try {
        const res = await fetch(`${API_URL}/solicitacoes/${idSolicitacao}/responder-avaliacao`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resposta })
        });

        if (res.ok) {
            mostrarToast('Resposta enviada com sucesso!', 'sucesso');
            carregarConcluidosPrestador();
        } else {
            mostrarToast('Erro ao enviar resposta.', 'erro');
        }
    } catch (e) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// Função: Busca as ordens já concluídas pelo prestador logado
async function carregarConcluidosPrestador() {
    const conteudo = document.getElementById('conteudoDinamicoPrestador');
    if (!conteudo) {
        showPage('dashboard-prestador', '?aba=concluidos');
        return;
    }
    conteudo.innerHTML = '<p style="color: var(--text-muted);">A buscar histórico de serviços concluídos...</p>';

    const idPrestador = localStorage.getItem('idUsuarioLogado');
    try {
        const res = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
        let solicitacoes = await res.json();

        if (solicitacoes && !Array.isArray(solicitacoes)) {
            solicitacoes = solicitacoes.solicitacoes || solicitacoes.dados || Object.values(solicitacoes);
        }

        const concluidos = solicitacoes.filter(s =>
            String(s.cod_prestador) === String(idPrestador) &&
            ((s.status || '').toLowerCase().includes('avaliado') || (s.status || '').toLowerCase() === 'concluído')
        );

        if (Array.isArray(concluidos) && concluidos.length > 0) {
            conteudo.innerHTML = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: var(--primary); font-size: 22px; margin-bottom: 5px;">Serviços Concluídos ✅</h3>
                    <p style="color: var(--text-muted); font-size: 14px;">Seu histórico de trabalhos finalizados e avaliações recebidas.</p>
                </div>
                <div style="display: grid; gap: 20px;">
                ${concluidos.map(s => {
                    const dataPed = s.data_servico ? s.data_servico.split('T')[0] : 'Data não informada';
                    const servicoNome = s.servico || s.descricao || 'Serviço ResolvJá';

                    let avaliacaoHtml = '';
                    if (s.nota_avaliacao && s.nota_avaliacao > 0) {
                        const estrelas = '⭐'.repeat(s.nota_avaliacao);
                        let respostaHtml = '';

                        if (s.resposta_avaliacao) {
                            respostaHtml = `
                                <div style="margin-top: 10px; padding: 10px; background: #fff; border-left: 3px solid var(--accent); border-radius: 4px;">
                                    <strong>Sua resposta:</strong> <span style="color: var(--text-muted);">"${s.resposta_avaliacao}"</span>
                                </div>
                            `;
                        } else {
                            respostaHtml = `
                                <div style="margin-top: 10px; display: flex; gap: 10px;">
                                    <input type="text" id="input-resp-${s.id_solicitacao}" placeholder="Responda a esta avaliação..." style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px;">
                                    <button class="btn btn-secondary btn-sm" onclick="enviarRespostaAvaliacao('${s.id_solicitacao}')">Responder</button>
                                </div>
                            `;
                        }

                        avaliacaoHtml = `
                            <div style="margin-top: 15px; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px dashed var(--success);">
                                <strong>Avaliação do Cliente:</strong> ${estrelas} <br>
                                <span style="color: var(--text-muted); font-style: italic;">"${s.comentario_avaliacao || 'Sem comentário'}"</span>
                                ${respostaHtml}
                            </div>
                        `;
                    } else {
                        avaliacaoHtml = `<p style="margin-top: 15px; font-size: 13px; color: var(--text-muted); text-align: center;">Aguardando o cliente deixar a avaliação.</p>`;
                    }

                    return `
                        <div style="background: var(--surface); border: 1px solid var(--border); border-left: 5px solid var(--success); border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
                                <h4 style="color: var(--primary); font-size: 18px; margin: 0;"><i class="fas fa-check-circle" style="color: var(--success); margin-right: 8px;"></i>${servicoNome}</h4>
                                <span style="background: rgba(16, 185, 129, 0.15); color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${s.status}</span>
                            </div>
                            <div style="font-size: 14px; color: var(--text-main);">
                                <div><strong>Local:</strong> ${s.endereco || 'Endereço não informado'}</div>
                                <div><strong>Data de Conclusão:</strong> ${dataPed}</div>
                            </div>
                            ${avaliacaoHtml}
                        </div>
                    `;
                }).join('')}
                </div>
            `;
        } else {
            conteudo.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-box-open" style="font-size: 48px; color: var(--border); margin-bottom: 15px;"></i>
                    <h3>Nenhum serviço concluído</h3>
                    <p>Os serviços finalizados aparecerão aqui.</p>
                </div>
            `;
        }
    } catch (e) {
        conteudo.innerHTML = '<p style="color: var(--error);">Erro ao carregar serviços concluídos.</p>';
    }
}

// ==========================================
// 6. CATÁLOGO COMPLETO E PRESTADORES
// ==========================================
async function carregarCatalogoServicosCompleto() {
    const container = document.getElementById('container-catalogo-servicos');
    if (!container) return;

    container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">A carregar todos os serviços disponíveis...</p>';

    try {
        const resposta = await fetch(`${API_URL}/servicos`, { cache: 'no-store' });

        if (!resposta.ok) {
            throw new Error('Erro ao buscar serviços na API');
        }

        const servicos = await resposta.json();

        if (!Array.isArray(servicos) || servicos.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">Nenhum serviço encontrado no momento.</p>';
            return;
        }

        container.innerHTML = '';
        servicos.forEach(servico => {
            const card = document.createElement('div');
            card.className = 'catalog-card';

            const nomeServico = servico.nome_servico || servico.titulo || servico.nome || 'Serviço ResolvJá';
            const descServico = servico.descricao || 'Serviço profissional qualificado e seguro.';
            const catServico = servico.categoria || 'Geral';
            const precoMin = servico.preco_minimo ? Number(servico.preco_minimo).toFixed(2).replace('.', ',') : '35,00';
            const idServico = servico.id_tipo_servico ?? servico.id ?? servico.id_servico ?? '';

            // Foto inicial segura enquanto o sistema inteligente verifica a pasta local e o link automático
            const fotoInicial = (typeof window.obterImagemServico === 'function')
                ? window.obterImagemServico(servico)
                : 'assets/servicos/faxina.jpg';

            card.setAttribute('data-servico-id', idServico);
            card.setAttribute('data-servico-nome', nomeServico);
            card.setAttribute('data-nome', `${nomeServico} ${descServico} ${catServico}`.toLowerCase());

            const nomeEscapado = nomeServico.replace(/'/g, "\\'");
            card.innerHTML = `
                <div class="catalog-img" style="background-image: url('${fotoInicial}'); background-size: cover; background-position: center; background-color: transparent;">
                    <span class="catalog-badge">${catServico}</span>
                </div>
                <div class="catalog-body">
                    <h3>${nomeServico}</h3>
                    <p>${descServico}</p>
                    <div class="catalog-footer">
                        <span class="catalog-price">A partir de <strong>R$ ${precoMin}</strong><br><small style="color: var(--text-muted); font-size: 11px;">*Valor final sujeito a alterações conforme serviço prestado</small></span>
                        <button class="btn btn-primary btn-sm" onclick="solicitarServicoCatalogo('${nomeEscapado}')">Solicitar</button>
                    </div>
                </div>
            `;

            // Aplica a imagem local em assets/servicos/ ou puxa automaticamente pelo link inteligente se faltar
            const divImg = card.querySelector('.catalog-img');
            if (typeof window.aplicarFotoInteligenteNoCard === 'function') {
                window.aplicarFotoInteligenteNoCard(divImg, servico, 'ia');
            }

            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar o catálogo de serviços:", erro);
        container.innerHTML = '<p class="error-msg">Erro ao carregar os serviços do banco de dados. Verifique se o servidor está ligado.</p>';
    }
}

// Função: Navega para profissionais.html ou carrega a lista se já estiver nela
async function carregarPrestadoresDisponiveis() {
    const container = document.getElementById('container-lista-prestadores');
    if (!container) {
        showPage('providers');
        return;
    }

    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">A procurar profissionais na sua área...</p>';

    try {
        const resposta = await fetch(`${API_URL}/prestadores`, { cache: 'no-store' });
        const prestadores = await resposta.json();

        if (resposta.ok && prestadores.length > 0) {
            container.innerHTML = prestadores.map(p => {
                const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : 'P';
                const profissao = p.profissao_funcao || 'Profissional Qualificado';
                const valorMin = p.valor_minimo ? Number(p.valor_minimo).toFixed(2) : 'A combinar';
                const pagamentos = p.formas_pagamento || 'A combinar';
                const fotoPrestadorUrl = resolverUrlFoto(p.foto_perfil);
                const avatarHtml = fotoPrestadorUrl
                    ? `<img src="${fotoPrestadorUrl}" alt="${p.nome}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary);">`
                    : `<div style="width: 60px; height: 60px; background: var(--secondary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">${inicial}</div>`;

                return `
                    <div class="provider-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
                            ${avatarHtml}
                            <div class="provider-info">
                                <h3 style="color: var(--primary); margin-bottom: 4px; font-size: 18px;">${p.nome}</h3>
                                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 4px;">${profissao}</p>
                                <div style="display: flex; gap: 10px; font-size: 13px; color: var(--text-main);">
                                    <span style="color: #F59E0B;"><i class="fas fa-star"></i> Avaliações</span>
                                    <span><i class="fas fa-map-marker-alt"></i> ${p.endereco_completo ? p.endereco_completo.split('-')[0] : 'Local Indisponível'}</span>
                                </div>
                                <div style="color: var(--success); font-weight: bold; font-size: 13px; margin-top: 4px;">Diária a partir de R$ ${valorMin}*</div>
                                <div style="color: var(--text-muted); font-size: 12px; margin-top: 3px;"><i class="fas fa-credit-card"></i> Aceita: ${pagamentos}</div>
                            </div>
                        </div>
                        <button class="btn btn-outline-light" style="border: 2px solid var(--primary); color: var(--primary); font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.3s; width: 100%;" onmouseover="this.style.background='var(--primary)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--primary)';" onclick="verPerfilPrestador('${p.cod_prestador}')">Ver Perfil</button>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum profissional encontrado no momento.</p>';
        }
    } catch (erro) {
        container.innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Falha ao carregar a lista de profissionais.</p>';
    }
}

// Função: Navega para perfil-prestador.html ou carrega detalhes do prestador se já estiver nela
async function verPerfilPrestador(codPrestador) {
    const container = document.getElementById('container-detalhe-prestador');
    if (!container) {
        showPage('detalhe-prestador', `?id=${encodeURIComponent(codPrestador)}`);
        return;
    }

    container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">A carregar perfil do profissional...</p>';

    try {
        const res = await fetch(`${API_URL}/prestadores`, { cache: 'no-store' });
        const prestadores = await res.json();
        const p = prestadores.find(item => String(item.cod_prestador) === String(codPrestador));

        if (!p) {
            container.innerHTML = '<p style="color: var(--error); text-align: center;">Prestador não encontrado.</p>';
            return;
        }

        const resSols = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
        const solicitacoesAll = await resSols.json();
        const avaliacoesPrestador = solicitacoesAll.filter(s => String(s.cod_prestador) === String(codPrestador) && s.nota_avaliacao && s.nota_avaliacao > 0);

        let mediaNotas = 5.0;
        let avaliacoesHTML = '<p style="color:var(--text-muted);">Ainda não há avaliações de clientes.</p>';

        if (avaliacoesPrestador.length > 0) {
            const soma = avaliacoesPrestador.reduce((acc, curr) => acc + Number(curr.nota_avaliacao), 0);
            mediaNotas = (soma / avaliacoesPrestador.length).toFixed(1);

            avaliacoesHTML = avaliacoesPrestador.map(av => {
                const estrelas = '⭐'.repeat(av.nota_avaliacao);
                const respostaPrestador = av.resposta_avaliacao
                    ? `<div style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-left: 3px solid var(--accent); border-radius: 4px; font-size: 13px;">
                           <strong>Resposta do Profissional:</strong> <span style="color: var(--text-muted);">"${av.resposta_avaliacao}"</span>
                       </div>`
                    : '';

                return `
                    <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <strong>${av.solicitante_nome || 'Cliente'}</strong>
                            <span>${estrelas}</span>
                        </div>
                        <p style="color: var(--text-muted); font-style: italic;">"${av.comentario_avaliacao || 'Serviço prestado com sucesso.'}"</p>
                        <small style="color: #aaa;">Serviço: ${av.servico || av.descricao}</small>
                        ${respostaPrestador}
                    </div>
                `;
            }).join('');
        }

        const fotoDetalheUrl = resolverUrlFoto(p.foto_perfil);
        const avatar = fotoDetalheUrl
            ? `<img src="${fotoDetalheUrl}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--secondary); display: block; margin: 0 auto 15px;">`
            : `<div style="width: 100px; height: 100px; background: var(--secondary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; margin: 0 auto 15px;">${p.nome.charAt(0)}</div>`;

        const profissaoEscapada = (p.profissao_funcao || 'Geral').replace(/'/g, "\\'");

        container.innerHTML = `
            <div style="background: var(--surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                ${avatar}
                <h2 style="text-align: center; color: var(--primary); margin-bottom: 5px;">${p.nome}</h2>
                <p style="text-align: center; color: var(--text-muted); font-size: 16px; margin-bottom: 20px;">${p.profissao_funcao || 'Prestador de Serviços'}</p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 15px; background: #fdfdfd; padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                    <div><strong>Experiência:</strong> ${p.experiencia || 'Não informada'}</div>
                    <div><strong>Avaliação Geral:</strong> ⭐ ${mediaNotas} (${avaliacoesPrestador.length} avaliações)</div>
                    <div><strong>Valor Diária / Base:</strong> R$ ${p.valor_minimo ? Number(p.valor_minimo).toFixed(2) : 'A combinar'}</div>
                    <div><strong>Disponibilidade:</strong> ${p.disponibilidade_horario || 'A combinar'}</div>
                    <div style="grid-column: 1 / -1;"><strong>Formas de Pagamento Aceitas:</strong> ${p.formas_pagamento || 'A combinar diretamente com o profissional'}</div>
                </div>

                <div class="aviso-valor-sujeito">
                    <strong><i class="fas fa-info-circle" style="color: var(--accent);"></i> Atenção sobre valores:</strong>
                    O valor final está sujeito a alterações de acordo com o serviço prestado e será combinado diretamente com o profissional.
                </div>

                <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px;">Histórico e Serviços Realizados</h3>
                <p style="color: var(--text-main); margin-bottom: 20px;">${p.descricao_funcoes || 'Profissional dedicado com histórico de excelência em atendimento na região.'}</p>

                <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px; border-top: 1px solid var(--border); padding-top: 20px;">Avaliações Recebidas</h3>
                <div style="margin-bottom: 25px;">
                    ${avaliacoesHTML}
                </div>

                <button class="btn btn-primary btn-full" onclick="solicitarServicoCatalogo('${profissaoEscapada}', '${p.cod_prestador}')">Contratar este Profissional</button>
            </div>
        `;
    } catch (e) {
        container.innerHTML = '<p style="color: var(--error); text-align: center;">Erro ao carregar os dados do prestador.</p>';
    }
}

// Função: Filtra e exibe resultados da pesquisa local no catálogo
function filtrarCatalogoServicos() {
    const input = document.getElementById('inputBuscaCatalogo');
    if (!input) return;

    const termo = input.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.catalog-card');

    cards.forEach(card => {
        const textoVisivel = card.innerText.toLowerCase();
        const tagOculta = (card.getAttribute('data-nome') || '').toLowerCase();

        if (textoVisivel.includes(termo) || tagOculta.includes(termo)) {
            card.style.setProperty('display', 'flex', 'important');
        } else {
            card.style.setProperty('display', 'none', 'important');
        }
    });
}

// ==========================================
// 7. ALTERNAR PERFIL
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
// 8. TEMA CLARO / ESCURO E INICIALIZAÇÃO POR PÁGINA
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

// Inicialização automática conforme a página HTML atual
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

    // 3. Executa a inicialização específica da página aberta
    const paginaAtual = document.body.getAttribute('data-page') || '';
    const params = new URLSearchParams(window.location.search);

    if (paginaAtual === 'catalogo-completo') {
        carregarCatalogoServicosCompleto();
    } else if (paginaAtual === 'providers') {
        carregarPrestadoresDisponiveis();
    } else if (paginaAtual === 'detalhe-prestador') {
        const idPrestador = params.get('id');
        if (idPrestador) verPerfilPrestador(idPrestador);
    } else if (paginaAtual === 'avaliacoes') {
        abrirTelaAvaliacoesSite();
    } else if (paginaAtual === 'dashboard-solicitante') {
        carregarSaudacaoDashboard();
    } else if (paginaAtual === 'dashboard-prestador') {
        carregarSaudacaoDashboard();
        const aba = params.get('aba');
        if (aba === 'oportunidades') carregarOportunidadesPrestador();
        else if (aba === 'agenda') carregarAgendaPrestador();
        else if (aba === 'concluidos') carregarConcluidosPrestador();
    } else if (paginaAtual === 'minhas-solicitacoes') {
        carregarMinhasSolicitacoes();
    } else if (paginaAtual === 'request') {
        inicializarPaginaSolicitar();
    } else if (paginaAtual === 'meu-perfil') {
        carregarDadosPerfil();
    } else if (paginaAtual === 'avaliacao') {
        const idSol = params.get('id');
        const campoId = document.getElementById('idSolicitacaoAvaliacao');
        if (campoId && idSol) campoId.value = idSol;
    } else if (paginaAtual === 'register') {
        const tipoUrl = params.get('tipo');
        const selectTipo = document.getElementById('regTipo');
        if (tipoUrl && selectTipo) {
            selectTipo.value = tipoUrl;
            toggleCamposPrestador();
        }
        // Pré-preenche caso o usuário tenha vindo do botão "Alternar Perfil"
        const preDadosStr = sessionStorage.getItem('dadosPreCadastro');
        if (preDadosStr) {
            try {
                const pre = JSON.parse(preDadosStr);
                if (selectTipo && pre.tipo) { selectTipo.value = pre.tipo; toggleCamposPrestador(); }
                if (document.getElementById('regNome')) document.getElementById('regNome').value = pre.nome || '';
                if (document.getElementById('regEmail')) document.getElementById('regEmail').value = pre.email || '';
                if (document.getElementById('regCpf')) document.getElementById('regCpf').value = pre.cpf || '';
                if (document.getElementById('regRg')) document.getElementById('regRg').value = pre.rg || '';
                if (document.getElementById('regTelefone')) document.getElementById('regTelefone').value = pre.telefone || '';
            } catch (e) {}
            sessionStorage.removeItem('dadosPreCadastro');
        }
    }
});

// ==========================================================================
// 9. ANIMAÇÃO DE CLIQUE E CURSOR PERSONALIZADO (ORIGINAL PRESERVADO 100%)
// ==========================================================================
// clique.js — efeito de clique: anelzinho + cursor que "aperta" (reduz e volta) ao clicar.
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