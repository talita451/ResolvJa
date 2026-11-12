const API_URL = 'http://localhost:3000/ResolvJa';

let historicoTelas = [];

console.log("🛠️ Frontend ResolvJá carregado com sucesso!");

// ==========================================
// 1. NAVEGAÇÃO E INTERFACE (UI)
// ==========================================
// Função: Altera a página visível no modo Single Page Application
function showPage(pageId) {
    const telaAtual = document.querySelector('.page.active');
    
    if (telaAtual && telaAtual.id !== pageId) {
        historicoTelas.push(telaAtual.id);
    }

    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Se a página aberta for o catálogo completo, carrega todos os serviços do banco de dados
    if (pageId === 'catalogo-completo') {
        carregarCatalogoServicosCompleto();
    }
}

// Função: Regressa para a última página acessada
function voltarTelaAnterior() {
    if (historicoTelas.length > 0) {
        const telaAnterior = historicoTelas.pop();
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(telaAnterior).classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showPage('home');
    }
}

// Função: Alterna a exibição do menu dropdown do utilizador (minha conta)
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if(dropdown) dropdown.classList.toggle('show');
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
}

// Função: Gerencia o estado de autenticação (logado vs deslogado) na interface Navbar
function atualizarInterfaceAuth() {
    const logado = localStorage.getItem('idUsuarioLogado');
    const btnEntrar = document.getElementById('nav-auth-btn');
    const btnPainel = document.getElementById('nav-painel-btn');
    const menuUsuario = document.getElementById('userMenuContainer');
    const avatarBtn = document.getElementById('navAvatarBtn');
    const miniFoto = document.getElementById('dropdownMiniFoto');
    
    if (btnEntrar && menuUsuario) {
        if (logado) {
            btnEntrar.style.display = 'none';
            menuUsuario.style.display = 'inline-block';
            if (btnPainel) btnPainel.style.display = 'inline-flex'; // MOSTRA O BOTÃO MEU PAINEL

            const fotoSalva = localStorage.getItem('fotoUsuarioLogado');
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
async function redirecionarDashboard() {
    const logado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado');

    if (!logado) {
        mostrarToast('Faça login primeiro!', 'erro');
        showPage('login');
        return;
    }

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

        if (tipo === 'prestador') {
            const h2Prestador = document.getElementById('tituloSaudacaoPrestador');
            if (h2Prestador) h2Prestador.textContent = `Olá, ${primeiroNome} 🛠️`;
            showPage('dashboard-prestador');
        } else {
            const h2Solicitante = document.getElementById('tituloSaudacaoSolicitante');
            if (h2Solicitante) h2Solicitante.textContent = `Olá, ${primeiroNome} 👋`;
            showPage('dashboard-solicitante');
        }
    } catch (e) {
        if (tipo === 'prestador') showPage('dashboard-prestador');
        else showPage('dashboard-solicitante');
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

    const fotoSalva = localStorage.getItem('fotoUsuarioLogado');
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
            localStorage.setItem('fotoUsuarioLogado', usuario.foto_perfil);
            avatarBtn.innerHTML = `<img src="${usuario.foto_perfil}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
            if (miniFoto) miniFoto.src = usuario.foto_perfil;
        }
    } catch (erro) {
        console.error("Erro ao carregar foto na navbar:", erro);
    }
}

// Evento Global: Executado assim que a página é carregada
document.addEventListener("DOMContentLoaded", () => {
    atualizarInterfaceAuth();
    carregarFotoNavbarImediata();
});

// ==========================================
// 2. ALERTAS (TOAST) E COMPRESSÃO
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

// Função: Converte imagens para Base64 em alta resolução e nitidez máxima
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
            
            // Aumentamos o limite para 1200px para garantir alta definição e nitidez no zoom
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
            
            // Qualidade máxima (1.0 = 100% de nitidez sem perdas de compressão)
            const base64AltaQualidade = canvas.toDataURL('image/jpeg', 1.0);
            const inputDestino = document.getElementById(idInputDestino);
            if (inputDestino) inputDestino.value = base64AltaQualidade;
            
            mostrarToast('Imagem em alta qualidade processada com sucesso!');
        };
    };
    leitor.readAsDataURL(arquivo);
}

// Função otimizada: Abre em tamanho 10x15 nítido, permite zoom ao clicar e arrastar para explorar
function ampliarFotoPerfil() {
  const imgElement = document.getElementById('dropdownMiniFoto');
  if (!imgElement || !imgElement.src) return;

  const srcOriginal = imgElement.src;

  // Cria o container do modal escuro
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'foto-modal-overlay';
  modalOverlay.title = 'Clique fora da foto para fechar';

  // Cria a imagem ampliada
  const imagemAmpliada = document.createElement('img');
  imagemAmpliada.src = srcOriginal;
  imagemAmpliada.className = 'foto-modal-content';

  let comZoom = false;
  let isDragging = false;
  let startX, startY;
  let translateX = 0;
  let translateY = 0;

  // Estado inicial: Abre logo num tamanho excelente (estilo 10x15)
  imagemAmpliada.style.transform = 'scale(1)';
  imagemAmpliada.style.cursor = 'zoom-in';

  // Clique na imagem: Alterna entre o tamanho 10x15 e o zoom aproximado
  imagemAmpliada.onclick = function(event) {
    event.stopPropagation();
    comZoom = !comZoom;

    if (comZoom) {
      // Aplica o zoom aproximado mantendo a nitidez
      imagemAmpliada.style.transform = `scale(2.2) translate(${translateX}px, ${translateY}px)`;
      imagemAmpliada.style.cursor = 'grab';
    } else {
      // Reseta para o tamanho 10x15 original
      translateX = 0;
      translateY = 0;
      imagemAmpliada.style.transform = 'scale(1) translate(0px, 0px)';
      imagemAmpliada.style.cursor = 'zoom-in';
    }
  };

  // Eventos para segurar clicado e mover (arrastar) quando estiver com zoom
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

  // Fecha o modal ao clicar no fundo escuro fora da foto
  modalOverlay.onclick = function(event) {
    if (event.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  };
}
// ==========================================
// 3. AUXILIARES DE FORMULÁRIO E VIA CEP
// ==========================================
// Função: Oculta ou mostra campos extra de cadastro dependendo de ser prestador ou cliente
function toggleCamposPrestador() {
    const tipo = document.getElementById('regTipo').value;
    const campos = document.getElementById('campos-prestador');
    if (campos) campos.style.display = tipo === 'prestador' ? 'grid' : 'none';
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

        const endRua = document.getElementById('regRua').value;
        const endNum = document.getElementById('regNumero').value;
        const endBairro = document.getElementById('regBairro').value;
        const endCidade = document.getElementById('regCidade').value;
        const enderecoFormatado = `${endRua}, ${endNum} - ${endBairro}, ${endCidade}`;

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
            if (tipoUsuario === 'solicitante' && resultado.solicitante) novoId = resultado.solicitante.id_solicitante;
            else if (tipoUsuario === 'prestador' && resultado.prestador) novoId = resultado.prestador.cod_prestador;
            
            localStorage.setItem('idUsuarioLogado', novoId);
            localStorage.setItem('tipoUsuarioLogado', tipoUsuario);
            if (fotoBase64) localStorage.setItem('fotoUsuarioLogado', fotoBase64);
            else localStorage.removeItem('fotoUsuarioLogado');

            atualizarInterfaceAuth();
            mostrarToast('Cadastro realizado com sucesso!');
            document.getElementById('form-cadastro').reset();
            redirecionarDashboard();
        } else { mostrarToast(resultado.erro || 'Erro ao realizar cadastro.', 'erro'); }
    } catch (erro) { mostrarToast('As alterações serão salvas.'); }
}

// Função: Autentica o utilizador fazendo verificação simples via Front-end vs API
async function login(event) {
    event.preventDefault();
    const usuarioInput = document.getElementById('loginUsuario').value;

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
            setTimeout(() => { redirecionarDashboard(); }, 1000);
            return;
        }

        const resSolicitante = await fetch(`${API_URL}/solicitantes`, { cache: 'no-store' });
        const solicitantes = await resSolicitante.json();
        const solicitanteEncontrado = solicitantes.find(s => s.email === usuarioInput || s.nome === usuarioInput);

        if (solicitanteEncontrado) {
            localStorage.setItem('idUsuarioLogado', solicitanteEncontrado.id_solicitante);
            localStorage.setItem('tipoUsuarioLogado', 'solicitante');
            localStorage.removeItem('fotoUsuarioLogado');
            
            atualizarInterfaceAuth();
            mostrarToast('Login efetuado com sucesso!');
            setTimeout(() => { redirecionarDashboard(); }, 1000);
            return;
        }

        mostrarToast('Utilizador ou senha incorretos.', 'erro');
    } catch (erro) {
        mostrarToast('Erro ao comunicar com o servidor.', 'erro');
    }
}

// Função: Busca e preenche o formulário de "Meu Perfil" com os dados do utilizador logado
async function carregarDadosPerfil() {
    showPage('meu-perfil');
    // Obtém o ID logado e limpa qualquer caractere indesejado (como :1 ou espaços)
    let idLogado = localStorage.getItem('idUsuarioLogado');
    if (idLogado) {
        idLogado = idLogado.toString().split(':')[0].trim();
    }
    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'prestador';

    if (!idLogado) {
        mostrarToast('Faça login primeiro!', 'erro');
        showPage('login');
        return;
    }

    try {
        // CORREÇÃO: Utiliza o endpoint com ID específico
        const endpoint = tipo === 'solicitante' ? `/solicitantes/${idLogado}` : `/prestadores/${idLogado}`;
        const resposta = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
        
        if (!resposta.ok) throw new Error('Erro ao buscar dados.');
        
        const usuario = await resposta.json(); // O back-end já retorna o usuário diretamente

        if (usuario) {
            document.getElementById('perfilNome').value = usuario.nome || '';
            document.getElementById('perfilEmail').value = usuario.email || '';
            document.getElementById('perfilTelefone').value = usuario.telefone || '';
            document.getElementById('perfilCpf').value = usuario.cpf || 'Não informado';
            document.getElementById('perfilRg').value = usuario.rg || 'Não informado';
            document.getElementById('perfilNascimento').value = usuario.data_nascimento ? usuario.data_nascimento.split('T')[0] : '';
            
            // CORREÇÃO: Usando a chave correta baseada no tipo (cliente = endereco, prestador = endereco_completo)
            document.getElementById('perfilEndereco').value = usuario.endereco_completo || usuario.endereco || '';
            
            const blocoProfissao = document.getElementById('bloco-perfil-profissao');
            if (tipo === 'prestador') {
                if (blocoProfissao) blocoProfissao.style.display = 'block';
                document.getElementById('perfilProfissao').value = usuario.profissao_funcao || '';
            } else {
                if (blocoProfissao) blocoProfissao.style.display = 'none';
            }
        }
    } catch (erro) {
        mostrarToast('Erro ao carregar os seus dados.', 'erro');
    }
}
  
// Função: Envia as alterações do perfil editado de volta ao Back-End
async function atualizarPerfil(event) {
    event.preventDefault();
    
    // Obtém o ID logado e limpa qualquer caractere indesejado (como :1 ou espaços)
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

    const fotoNovaBase64 = document.getElementById('perfilFotoBase64') ? document.getElementById('perfilFotoBase64').value : '';
    let payload = {};
    let endpointServidor = '';

    if (tipo === 'solicitante') {
        endpointServidor = `${API_URL}/solicitantes/${idLogado}`;
        payload = {
            nome: document.getElementById('perfilNome').value,
            email: document.getElementById('perfilEmail').value,
            telefone: document.getElementById('perfilTelefone').value,
            endereco: document.getElementById('perfilEndereco').value
        };
    } else {
        endpointServidor = `${API_URL}/prestadores/${idLogado}`;
        payload = {
            nome: document.getElementById('perfilNome').value,
            email: document.getElementById('perfilEmail').value,
            telefone: document.getElementById('perfilTelefone').value,
            endereco_completo: document.getElementById('perfilEndereco').value,
            profissao_funcao: document.getElementById('perfilProfissao') ? document.getElementById('perfilProfissao').value : null,
            foto_perfil: fotoNovaBase64 || undefined
        };
    }

    if (fotoNovaBase64) localStorage.setItem('fotoUsuarioLogado', fotoNovaBase64);

    try {
        const resposta = await fetch(endpointServidor, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await resposta.json();
        if (resposta.ok && !resultado.erro && !resultado.error) {
            mostrarToast('Dados atualizados com sucesso!', 'sucesso');
            atualizarInterfaceAuth();
            setTimeout(() => redirecionarDashboard(), 1500);
        } else {
            mostrarToast(resultado.erro || resultado.error || 'Erro ao atualizar dados.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

// ==========================================
// 5. PEDIDOS E AGENDA
// ==========================================
// Função: Redireciona o utilizador para abrir uma ordem de serviço e autopreenche dados
async function solicitarServicoCatalogo(nomeServico) {
    showPage('request');
    const select = document.getElementById('selectTipoServico');
    if (select) {
        try {
            const res = await fetch(`${API_URL}/servicos`, { cache: 'no-store' });
            const tipos = await res.json();
            if (Array.isArray(tipos) && tipos.length > 0) {
                // Usa t.nome (que vem do banco) e adiciona a opção "Outros" no final
                select.innerHTML = tipos.map(t => 
                    `<option value="${t.nome}" data-id="${t.id_tipo_servico}">${t.nome}</option>`
                ).join('') + `<option value="Outros">Outro Serviço (Especificar)</option>`;
            }
        } catch(e) {
            console.log("Mantendo opções padrão.");
        }
        select.value = nomeServico;
        verificarOutroServico(select);
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
        } catch(e) {
            console.error("Erro no auto-preenchimento", e);
        }
    }
}

// Função: Submete um pedido de novo serviço no sistema
async function submitRequest(event) {
    event.preventDefault();
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
    
    const idLogado = localStorage.getItem('idUsuarioLogado') || 1;
    const hInicio = document.getElementById('reqHoraInicio').value;
    const hFim = document.getElementById('reqHoraFim').value;
    const intervaloHorario = `${hInicio} às ${hFim}`;

    let codPrestadorAtribuido = null;
    try {
        const resPrestadores = await fetch(`${API_URL}/prestadores`, { cache: 'no-store' });
        const prestadores = await resPrestadores.json();
        
        if (Array.isArray(prestadores) && prestadores.length > 0) {
            let prestadorEncontrado = prestadores.find(p => 
                p.profissao_funcao && p.profissao_funcao.toLowerCase().includes(tipoServico.toLowerCase())
            );
            if (!prestadorEncontrado) {
                prestadorEncontrado = prestadores.find(p => 
                    p.profissao_funcao && (
                        p.profissao_funcao.toLowerCase().includes('marido de aluguel') || 
                        p.profissao_funcao.toLowerCase().includes('geral') ||
                        p.profissao_funcao.toLowerCase().includes('reparos')
                    )
                );
            }
            if (prestadorEncontrado) codPrestadorAtribuido = prestadorEncontrado.cod_prestador;
        }
    } catch (e) {
        console.log("Erro ao buscar prestador automático.");
    }

    const descExtra = document.getElementById('reqDescricao').value;
    const titulo = document.getElementById('reqTitulo').value;
    const descricaoFinal = descExtra ? `[${tipoServico}] ${titulo} - ${descExtra}` : `[${tipoServico}] ${titulo}`;

    const payload = {
        id_solicitante: Number(idLogado), 
        id_tipo_servico: idTipoServico, 
        cod_prestador: codPrestadorAtribuido ? Number(codPrestadorAtribuido) : null, 
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
            carregarMinhasSolicitacoes();
        } else {
            mostrarToast(resultado.erro || resultado.error || 'Erro ao gravar na Base de Dados.', 'erro');
        }
    } catch (erro) { 
        mostrarToast('Erro de ligação com o servidor.', 'erro'); 
    }
}

// ----------------------------------------------------
// FLUXO DE AVALIAÇÃO COM ESTRELAS E FOTO (CLIENTE)
// ----------------------------------------------------
// Função: Redireciona e prepara a tela de avaliação após término do serviço
function abrirTelaAvaliacao(idSolicitacao) {
    document.getElementById('idSolicitacaoAvaliacao').value = idSolicitacao;
    document.getElementById('form-avaliacao').reset();
    document.getElementById('fotoAvaliacaoBase64').value = '';
    selecionarEstrela(0, 'star-rating', 'notaAvaliacao'); 
    showPage('avaliacao');
}

// Função: Aplica animação das estrelas selecionadas visualmente
function selecionarEstrela(nota, containerId, inputId) {
    document.getElementById(inputId).value = nota;
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
        if(idLogado) {
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

// Função: Exibe as avaliações no site mesclando reais e avaliações fictícias (mocks) de 5 estrelas
async function abrirTelaAvaliacoesSite() {
    showPage('avaliacoes');
    const container = document.getElementById('lista-avaliacoes-site');
    if (!container) return;

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

        // Junta as avaliações reais do banco com as fictícias do sistema
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
        // Se a API falhar, mostra pelo menos os Mocks
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
// Função: Centraliza a alteração do status (ex: "A caminho", "Concluído")
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
    showPage('minhas-solicitacoes');
    const lista = document.getElementById('lista-minhas-solicitacoes');
    if(!lista) return;

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

                let acaoCliente = '';
                if (statusPed.toLowerCase() === 'concluído') {
                    acaoCliente = `<button class="btn btn-primary btn-sm" onclick="abrirTelaAvaliacao('${idPed}')" style="margin-top: 15px; background-color: #F59E0B; width: 100%; border: none;">Deixar Avaliação ⭐</button>`;
                }

                return `
                    <div style="background: var(--surface); border: 1px solid var(--border); border-left: 5px solid var(--primary); padding: 25px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px;">Pedido #${idPed}</h3>
                        <p style="margin-bottom: 5px;"><strong>Data Pretendida:</strong> ${dataPed} (${horarioPed})</p>
                        <p style="margin-bottom: 5px;"><strong>Endereço:</strong> ${enderecoPed}</p>
                        <p style="margin-bottom: 10px;"><strong>Descrição:</strong> ${descricaoPed}</p>
                        <p>Status: <span style="color: var(--success); font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 20px;">${statusPed}</span></p>
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
    if (!conteudo) return;
    conteudo.innerHTML = '<p style="color: var(--text-muted);">A procurar oportunidades disponíveis...</p>';
    
    try {
        const res = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
        let solicitacoes = await res.json();
        
        if (solicitacoes && !Array.isArray(solicitacoes)) {
            solicitacoes = solicitacoes.solicitacoes || solicitacoes.dados || Object.values(solicitacoes);
        }
        
        const disponiveis = solicitacoes.filter(s => !s.cod_prestador && (!s.status || s.status.toLowerCase() === 'pendente'));

        if (Array.isArray(disponiveis) && disponiveis.length > 0) {
            conteudo.innerHTML = `
                <h3 style="color: var(--primary); margin-bottom: 15px;">Oportunidades na Região 💼</h3>
                ${disponiveis.map(s => {
                    const idPed = s.id_solicitacao || s.id;
                    const dataPed = s.data_servico ? s.data_servico.split('T')[0] : 'Data não informada';
                    return `
                        <div style="background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid var(--accent);">
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
            mostrarToast('Serviço aceito com sucesso! Adicionado à sua agenda.');
            carregarOportunidadesPrestador();
        } else {
            const erroJson = await resposta.json();
            mostrarToast(erroJson.erro || 'Erro ao aceitar a solicitação.', 'erro');
        }
    } catch (e) {
        mostrarToast('Erro de ligação com o servidor.', 'erro');
    }
}

// Função: Busca as ordens ativas vinculadas ao prestador (Agenda)
async function carregarAgendaPrestador() {
    showPage('dashboard-prestador');
    const conteudo = document.getElementById('conteudoDinamicoPrestador');
    if (!conteudo) return;
    conteudo.innerHTML = '<p style="color: var(--text-muted);">A carregar a sua agenda de serviços...</p>';
    
    const idPrestador = localStorage.getItem('idUsuarioLogado');
    try {
        const res = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
        let solicitacoes = await res.json();
        
        if (solicitacoes && !Array.isArray(solicitacoes)) {
            solicitacoes = solicitacoes.solicitacoes || solicitacoes.dados || Object.values(solicitacoes);
        }
        
        const minhasSolicitacoes = solicitacoes.filter(s => 
            String(s.cod_prestador) === String(idPrestador) && 
            !(s.status || '').toLowerCase().includes('avaliado') &&
            (s.status || '').toLowerCase() !== 'concluído'
        );

        if (Array.isArray(minhasSolicitacoes) && minhasSolicitacoes.length > 0) {
            conteudo.innerHTML = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: var(--primary); font-size: 22px; margin-bottom: 5px;">Minha Agenda Profissional 📅</h3>
                    <p style="color: var(--text-muted); font-size: 14px;">Compromissos confirmados, a caminho ou aguardando conclusão.</p>
                </div>
                <div style="display: grid; gap: 20px;">
                ${minhasSolicitacoes.map(s => {
                    const dataPed = s.data_servico ? s.data_servico.split('T')[0] : 'Data não informada';
                    const servicoNome = s.servico || s.descricao || 'Serviço ResolvJá';
                    const statusAtual = (s.status || 'Pendente').toLowerCase();

                    let botoesAcao = '';
                    if (statusAtual.includes('aceito')) {
                        botoesAcao = `<button class="btn btn-secondary btn-sm" onclick="atualizarStatusServico('${s.id_solicitacao}', 'A caminho', '🚗 Cliente notificado que você está a caminho!')" style="margin-top: 15px; width: 100%;">Marcar como "Estou a Caminho"</button>`;
                    } else if (statusAtual === 'a caminho') {
                        botoesAcao = `<button class="btn btn-primary btn-sm" onclick="atualizarStatusServico('${s.id_solicitacao}', 'Concluído', '✅ Serviço marcado como concluído! Ele será movido para os concluídos após a avaliação.')" style="margin-top: 15px; background-color: var(--success); width: 100%; border: none;">Concluir Serviço</button>`;
                    }

                    return `
                        <div style="background: var(--surface); border: 1px solid var(--border); border-left: 5px solid var(--accent); border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <h4 style="color: var(--primary); font-size: 18px; margin: 0;"><i class="fas fa-tools" style="color: var(--accent); margin-right: 8px;"></i>${servicoNome}</h4>
                                <span style="background: rgba(16, 185, 129, 0.15); color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${s.status}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; font-size: 14px; color: var(--text-main);">
                                <div><strong><i class="fas fa-clock" style="color: var(--secondary); margin-right: 6px;"></i>Horário:</strong> ${s.horario || 'A combinar'} (${dataPed})</div>
                                <div style="grid-column: span 2;"><strong><i class="fas fa-map-marker-alt" style="color: var(--accent); margin-right: 6px;"></i>Endereço Completo:</strong> ${s.endereco || 'Endereço não informado'}</div>
                            </div>
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
// Função: Permite que o Prestador responda uma avaliação deixada por um cliente
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
    showPage('dashboard-prestador');
    const conteudo = document.getElementById('conteudoDinamicoPrestador');
    if (!conteudo) return;
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
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
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
// CATÁLOGO COMPLETO DINÂMICO (BANCO DE DADOS + IMAGENS INTELIGENTES POR PROFISSÃO)
// ==========================================
// Função: Busca TODOS os serviços cadastrados na API/Banco e renderiza no Grid com imagens contextualizadas
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
            
            // Pega o nome correto de forma dinâmica vindo do banco
            const nomeServico = servico.nome_servico || servico.titulo || servico.nome || 'Serviço ResolvJá';
            const descServico = servico.descricao || 'Serviço profissional qualificado e seguro.';
            const catServico = servico.categoria || 'Geral';
            const precoMin = servico.preco_minimo ? Number(servico.preco_minimo).toFixed(2).replace('.', ',') : '35,00';

            // Garante que não dá erro se a foto não existir no banco
            let fotoServico = servico.foto || '';
            
            // Se não houver foto, aplica a inteligência para escolher do Unsplash
            if (fotoServico === '' || fotoServico.includes('unsplash.com')) {
                const textoBusca = (nomeServico + " " + descServico + " " + catServico).toLowerCase();
                
                if (textoBusca.includes('jardin') || textoBusca.includes('grama') || textoBusca.includes('poda')) {
                    fotoServico = 'assets/jardineiro.jpg';
                } else if (textoBusca.includes('limpeza') || textoBusca.includes('faxina') || textoBusca.includes('organizer') || textoBusca.includes('estofados') || textoBusca.includes('passadeira')) {
                    fotoServico = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('unha') || textoBusca.includes('manicure') || textoBusca.includes('massagi') || textoBusca.includes('sobrancelha') || textoBusca.includes('estética') || textoBusca.includes('cabeleireiro')) {
                    fotoServico = 'https://images.unsplash.com/photo-1632345031435-8727f6c97d34?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('elétric') || textoBusca.includes('lâmpada') || textoBusca.includes('fiação')) {
                    fotoServico = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('hidráulic') || textoBusca.includes('encanador') || textoBusca.includes('piscina') || textoBusca.includes('água')) {
                    fotoServico = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('pintor') || textoBusca.includes('pintura') || textoBusca.includes('gesso') || textoBusca.includes('drywall')) {
                    fotoServico = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('montador') || textoBusca.includes('móvel') || textoBusca.includes('marcen') || textoBusca.includes('serralheiro') || textoBusca.includes('vidraceiro')) {
                    fotoServico = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('ar-condicionado') || textoBusca.includes('climatiz')) {
                    fotoServico = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('pet ') || textoBusca.includes('cães') || textoBusca.includes('cachorro') || textoBusca.includes('tosa')) {
                    fotoServico = 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('fotografia') || textoBusca.includes('evento') || textoBusca.includes('churrasqueiro') || textoBusca.includes('garçom') || textoBusca.includes('cozinheiro')) {
                    fotoServico = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('computador') || textoBusca.includes('informática') || textoBusca.includes('câmera') || textoBusca.includes('rede')) {
                    fotoServico = 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('carro') || textoBusca.includes('veículo') || textoBusca.includes('motorista') || textoBusca.includes('mecânico') || textoBusca.includes('frete') || textoBusca.includes('mudança')) {
                    fotoServico = 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80'; 
                } else if (textoBusca.includes('babá') || textoBusca.includes('idoso') || textoBusca.includes('acompanhante') || textoBusca.includes('cuidador')) {
                    fotoServico = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80'; 
                } else {
                    fotoServico = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80'; 
                }
            }

            // Atributo data-nome utilizado pelo filtro de busca em tempo real
            card.setAttribute('data-nome', `${nomeServico} ${descServico} ${catServico}`.toLowerCase());

            card.innerHTML = `
                <div class="catalog-img" style="background-image: url('${fotoServico}'); background-size: cover; background-position: center; background-color: transparent;">
                    <span class="catalog-badge">${catServico}</span>
                </div>
                <div class="catalog-body">
                    <h3>${nomeServico}</h3>
                    <p>${descServico}</p>
                    <div class="catalog-footer">
                        <span class="catalog-price">A partir de <strong>R$ ${precoMin}</strong></span>
                        <button class="btn btn-primary btn-sm" onclick="solicitarServicoCatalogo('${nomeServico}')">Solicitar</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar o catálogo de serviços:", erro);
        container.innerHTML = '<p class="error-msg">Erro ao carregar os serviços do banco de dados. Verifique se o servidor está ligado.</p>';
    }
}
// Função: Busca prestadores na API e renderiza no catálogo de Profissionais
async function carregarPrestadoresDisponiveis() {
    showPage('providers');
    const container = document.getElementById('container-lista-prestadores');
    if (!container) return;

    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">A procurar profissionais na sua área...</p>';

    try {
        const resposta = await fetch(`${API_URL}/prestadores`, { cache: 'no-store' });
        const prestadores = await resposta.json();

        if (resposta.ok && prestadores.length > 0) {
            container.innerHTML = prestadores.map(p => {
                const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : 'P';
                const profissao = p.profissao_funcao || 'Profissional Qualificado';
                const valorMin = p.valor_minimo ? Number(p.valor_minimo).toFixed(2) : 'A combinar';
                const avatarHtml = p.foto_perfil 
                    ? `<img src="${p.foto_perfil}" alt="${p.nome}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary);">`
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
                                <div style="color: var(--success); font-weight: bold; font-size: 13px; margin-top: 4px;">Diária a partir de R$ ${valorMin}</div>
                            </div>
                        </div>
                        <button class="btn btn-outline-light" style="border: 2px solid var(--primary); color: var(--primary); font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.3s; width: 100%;" onmouseover="this.style.background='var(--primary)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--primary)';" onclick="verPerfilPrestador('${p.cod_prestador}')">Ver Perfil</button>
                    </div>
                `;
            }).join('');
        } else { container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum profissional encontrado no momento.</p>'; }
    } catch (erro) { container.innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Falha ao carregar a lista de profissionais.</p>'; }
}

// Função: Exibe detalhes, histórico e avaliações de um Prestador específico
async function verPerfilPrestador(codPrestador) {
    showPage('detalhe-prestador');
    const container = document.getElementById('container-detalhe-prestador');
    if (!container) return;

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

        const avatar = p.foto_perfil 
            ? `<img src="${p.foto_perfil}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--secondary); display: block; margin: 0 auto 15px;">`
            : `<div style="width: 100px; height: 100px; background: var(--secondary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; margin: 0 auto 15px;">${p.nome.charAt(0)}</div>`;

        container.innerHTML = `
            <div style="background: var(--surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                ${avatar}
                <h2 style="text-align: center; color: var(--primary); margin-bottom: 5px;">${p.nome}</h2>
                <p style="text-align: center; color: var(--text-muted); font-size: 16px; margin-bottom: 20px;">${p.profissao_funcao || 'Prestador de Serviços'}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #fdfdfd; padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                    <div><strong>Experiência:</strong> ${p.experiencia || 'Não informada'}</div>
                    <div><strong>Avaliação Geral:</strong> ⭐ ${mediaNotas} (${avaliacoesPrestador.length} avaliações)</div>
                    <div><strong>Valor Diária / Base:</strong> R$ ${p.valor_minimo ? Number(p.valor_minimo).toFixed(2) : 'A combinar'}</div>
                    <div><strong>Disponibilidade:</strong> ${p.disponibilidade_horario || 'A combinar'}</div>
                </div>

                <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px;">Histórico e Serviços Realizados</h3>
                <p style="color: var(--text-main); margin-bottom: 20px;">${p.descricao_funcoes || 'Profissional dedicado com histórico de excelência em atendimento na região.'}</p>

                <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px; border-top: 1px solid var(--border); padding-top: 20px;">Avaliações Recebidas</h3>
                <div style="margin-bottom: 25px;">
                    ${avaliacoesHTML}
                </div>

                <button class="btn btn-primary btn-full" onclick="solicitarServicoCatalogo('${p.profissao_funcao || 'Geral'}')">Contratar este Profissional</button>
            </div>
        `;
    } catch (e) {
        container.innerHTML = '<p style="color: var(--error); text-align: center;">Erro ao carregar os dados do prestador.</p>';
    }
}

// Função: Filtra e exibe resultados da pesquisa local no catálogo
// Função: Filtra e exibe resultados da pesquisa local no catálogo
function filtrarCatalogoServicos() {
    const input = document.getElementById('inputBuscaCatalogo');
    if(!input) return;
    
    const termo = input.value.toLowerCase().trim(); 
    const cards = document.querySelectorAll('.catalog-card');

    cards.forEach(card => {
        const textoVisivel = card.innerText.toLowerCase();
        const tagOculta = (card.getAttribute('data-nome') || '').toLowerCase();

        // Se o termo pesquisado existir no texto do cartão
        if (textoVisivel.includes(termo) || tagOculta.includes(termo)) {
            // Remove qualquer regra de ocultação e força a exibição
            card.style.setProperty('display', 'flex', 'important'); 
        } else {
            // FORÇA o cartão a desaparecer, vencendo qualquer regra do style.css
            card.style.setProperty('display', 'none', 'important');
        }
    });
}
// ==========================================
// 7. ALTERNAR PERFIL
// ==========================================
// Função: Transforma cliente em prestador (e vice-versa), mantendo login.
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
            mostrarToast(`Ainda não tem perfil de ${nomeDestino}. Preencha o que falta!`, 'sucesso');
            showPage('register');
            const selectTipo = document.getElementById('regTipo');
            if (selectTipo) { selectTipo.value = tipoDestino; toggleCamposPrestador(); }

            if (document.getElementById('regNome')) document.getElementById('regNome').value = userAtual.nome || '';
            if (document.getElementById('regEmail')) document.getElementById('regEmail').value = userAtual.email || '';
            if (document.getElementById('regCpf')) document.getElementById('regCpf').value = userAtual.cpf || '';
            if (document.getElementById('regRg')) document.getElementById('regRg').value = userAtual.rg || '';
            if (document.getElementById('regTelefone')) document.getElementById('regTelefone').value = userAtual.telefone || '';
        }
    } catch (erro) {
        mostrarToast("Erro de ligação ao tentar alternar o perfil.", "erro");
    }
}
// Função para alternar entre Modo Claro e Modo Escuro
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

// Carregar o tema salvo pelo utilizador ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
});