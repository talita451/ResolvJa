const API_URL = 'http://localhost:3000/api';

let historicoTelas = [];

console.log("🛠️ Frontend ResolvJá carregado com sucesso!");

// ==========================================
// 1. NAVEGAÇÃO E INTERFACE (UI)
// ==========================================
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
}

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

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if(dropdown) dropdown.classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.user-menu-container')) {
        const dropdowns = document.getElementsByClassName("user-dropdown");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function atualizarInterfaceAuth() {
    const logado = localStorage.getItem('idUsuarioLogado');
    const btnEntrar = document.getElementById('nav-auth-btn');
    const menuUsuario = document.getElementById('userMenuContainer');
    const avatarBtn = document.getElementById('navAvatarBtn');
    const miniFoto = document.getElementById('dropdownMiniFoto');
    
    if (btnEntrar && menuUsuario) {
        if (logado) {
            btnEntrar.style.display = 'none';
            menuUsuario.style.display = 'inline-block';

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
        }
    }
}

function tratarCliqueAuthNav() {
    showPage('login');
}

function redirecionarDashboard() {
    const logado = localStorage.getItem('idUsuarioLogado');
    if (logado) {
        showPage('dashboard-solicitante');
    } else {
        mostrarToast('Faça login primeiro!', 'erro');
        showPage('login');
    }
}

function logout() {
    localStorage.removeItem('idUsuarioLogado');
    localStorage.removeItem('tipoUsuarioLogado');
    localStorage.removeItem('fotoUsuarioLogado');
    atualizarInterfaceAuth();
    mostrarToast('Sessão encerrada com segurança.');
    showPage('home');
}

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
        const resposta = await fetch(`${API_URL}${endpoint}`);
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

document.addEventListener("DOMContentLoaded", () => {
    atualizarInterfaceAuth();
    carregarFotoNavbarImediata();
});

// ==========================================
// 2. ALERTAS (TOAST) E COMPRESSÃO DE IMAGEM
// ==========================================
function mostrarToast(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toast-central');
    if (!toast) return;

    toast.textContent = mensagem;
    toast.style.background = tipo === 'erro' ? '#EF4444' : '#10B981';
    toast.style.display = 'block';
    
    setTimeout(() => { toast.style.display = 'none'; }, 4500);
}

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
            
            const tamanhoMaximo = 200;
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
            
            const base64Comprimido = canvas.toDataURL('image/jpeg', 0.8);
            
            const inputDestino = document.getElementById(idInputDestino);
            if (inputDestino) {
                inputDestino.value = base64Comprimido;
            }
            mostrarToast('Imagem carregada e otimizada com sucesso!');
        };
    };
    leitor.readAsDataURL(arquivo);
}

// ==========================================
// 3. FOTO AMPLIADA (MODAL 1:1)
// ==========================================
function ampliarFotoPerfil() {
    const fotoSalva = localStorage.getItem('fotoUsuarioLogado');
    const modal = document.getElementById('modalFotoPerfil');
    const imgExpandida = document.getElementById('imgModalExpandida');

    if (!fotoSalva) {
        mostrarToast('Ainda não tem nenhuma foto de perfil guardada.', 'erro');
        return;
    }

    if (modal && imgExpandida) {
        imgExpandida.src = fotoSalva;
        modal.style.display = 'flex';
    }
}

function fecharModalFoto() {
    const modal = document.getElementById('modalFotoPerfil');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==========================================
// 4. AUXILIARES DE FORMULÁRIO E VIA CEP
// ==========================================
function toggleCamposPrestador() {
    const tipo = document.getElementById('regTipo').value;
    const campos = document.getElementById('campos-prestador');
    if (campos) {
        campos.style.display = tipo === 'prestador' ? 'grid' : 'none';
    }
}

function verificarOutroServico(select) {
    const containerNovo = document.getElementById('container-novo-servico');
    const inputCustom = document.getElementById('reqTipoServicoCustom');
    if (!containerNovo || !inputCustom) return;
    if (select.value === 'Outros') {
        containerNovo.style.display = 'flex';
        inputCustom.required = true;
    } else {
        containerNovo.style.display = 'none';
        inputCustom.required = false;
    }
}

function mascaraCep(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = v;
}

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

function buscarCepCadastro() { buscarCepGenerico('regCep', 'regRua', 'regBairro', 'regCidade', 'regNumero'); }
function buscarEnderecoPorCep() { buscarCepGenerico('reqCep', 'reqRua', 'reqBairro', 'reqCidade', 'reqNumero'); }

// ==========================================
// 5. AUTENTICAÇÃO (LOGIN E CADASTRO)
// ==========================================
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
            if (fotoBase64) {
                localStorage.setItem('fotoUsuarioLogado', fotoBase64);
            } else {
                localStorage.removeItem('fotoUsuarioLogado');
            }

            atualizarInterfaceAuth();
            mostrarToast('Cadastro realizado com sucesso!');
            document.getElementById('form-cadastro').reset();
            redirecionarDashboard();
        } else { mostrarToast(resultado.erro || 'Erro ao realizar cadastro.', 'erro'); }
    } catch (erro) { mostrarToast('Erro de comunicação com o servidor.', 'erro'); }
}

async function login(event) {
    event.preventDefault();
    const usuarioInput = document.getElementById('loginUsuario').value;

    try {
        const resPrestador = await fetch(`${API_URL}/prestadores`);
        const prestadores = await resPrestador.json();
        const prestadorEncontrado = prestadores.find(p => p.email === usuarioInput || p.nome === usuarioInput);

        if (prestadorEncontrado) {
            localStorage.setItem('idUsuarioLogado', prestadorEncontrado.cod_prestador);
            localStorage.setItem('tipoUsuarioLogado', 'prestador');
            if (prestadorEncontrado.foto_perfil) {
                localStorage.setItem('fotoUsuarioLogado', prestadorEncontrado.foto_perfil);
            } else {
                localStorage.removeItem('fotoUsuarioLogado');
            }
            atualizarInterfaceAuth();
            mostrarToast('Login efetuado com sucesso!');
            setTimeout(() => { redirecionarDashboard(); }, 1000);
            return;
        }

        const resSolicitante = await fetch(`${API_URL}/solicitantes`);
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
        console.error("Erro no login:", erro);
        mostrarToast('Erro ao comunicar com o servidor.', 'erro');
    }
}

// ==========================================
// 6. ATUALIZAR PERFIL E DADOS REAIS
// ==========================================
async function carregarDadosPerfil() {
    showPage('meu-perfil');
    const idLogado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'prestador';

    if (!idLogado) {
        mostrarToast('Faça login primeiro!', 'erro');
        showPage('login');
        return;
    }

    try {
        const endpoint = tipo === 'solicitante' ? `/solicitantes` : `/prestadores`;
        const resposta = await fetch(`${API_URL}${endpoint}`);
        const dados = await resposta.json();
        
        if (!resposta.ok) throw new Error('Erro ao buscar dados.');

        const usuario = dados.find(u => String(u.cod_prestador || u.id_solicitante) === String(idLogado));

        if (usuario) {
            document.getElementById('perfilNome').value = usuario.nome || '';
            document.getElementById('perfilEmail').value = usuario.email || '';
            document.getElementById('perfilTelefone').value = usuario.telefone || '';
            document.getElementById('perfilCpf').value = usuario.cpf || 'Não informado';
            document.getElementById('perfilRg').value = usuario.rg || 'Não informado';
            document.getElementById('perfilNascimento').value = usuario.data_nascimento ? usuario.data_nascimento.split('T')[0] : '';
            document.getElementById('perfilEndereco').value = usuario.endereco_completo || usuario.endereco || '';
            
            if (tipo === 'prestador') {
                document.getElementById('perfilProfissao').value = usuario.profissao_funcao || '';
                document.getElementById('perfilExperiencia').value = usuario.experiencia || 'intermediário';
                document.getElementById('perfilValorMin').value = usuario.valor_minimo || '';
                document.getElementById('perfilValorMax').value = usuario.valor_maximo || '';
                document.getElementById('perfilDisponibilidade').value = usuario.disponibilidade_horario || '';
                if (usuario.foto_perfil) {
                    document.getElementById('perfilFotoBase64').value = usuario.foto_perfil;
                    localStorage.setItem('fotoUsuarioLogado', usuario.foto_perfil);
                }
            }
        } else {
            mostrarToast('Dados do utilizador não encontrados.', 'erro');
        }
    } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
        mostrarToast('Erro ao carregar os seus dados.', 'erro');
    }
}

async function atualizarPerfil(event) {
    event.preventDefault();
    const idLogado = localStorage.getItem('idUsuarioLogado');
    const tipo = localStorage.getItem('tipoUsuarioLogado') || 'prestador';

    const fotoNovaBase64 = document.getElementById('perfilFotoBase64') ? document.getElementById('perfilFotoBase64').value : '';

    const payload = {
        nome: document.getElementById('perfilNome').value,
        email: document.getElementById('perfilEmail').value,
        telefone: document.getElementById('perfilTelefone').value,
        endereco_completo: document.getElementById('perfilEndereco').value,
        profissao_funcao: document.getElementById('perfilProfissao') ? document.getElementById('perfilProfissao').value : null,
        experiencia: document.getElementById('perfilExperiencia') ? document.getElementById('perfilExperiencia').value : null,
        valor_minimo: document.getElementById('perfilValorMin') ? Number(document.getElementById('perfilValorMin').value) : null,
        valor_maximo: document.getElementById('perfilValorMax') ? Number(document.getElementById('perfilValorMax').value) : null,
        disponibilidade_horario: document.getElementById('perfilDisponibilidade') ? document.getElementById('perfilDisponibilidade').value : null,
        foto_perfil: fotoNovaBase64 || undefined
    };

    if (fotoNovaBase64) {
        localStorage.setItem('fotoUsuarioLogado', fotoNovaBase64);
    }

    try {
        const resposta = await fetch(`${API_URL}/${tipo === 'solicitante' ? 'solicitantes' : 'prestadores'}/${idLogado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            mostrarToast('Dados atualizados com sucesso!', 'sucesso');
            atualizarInterfaceAuth();
            setTimeout(() => redirecionarDashboard(), 1500);
        } else {
            const resJson = await resposta.json();
            mostrarToast(resJson.erro || 'Erro ao atualizar dados.', 'erro');
        }
    } catch (erro) {
        mostrarToast('Erro de comunicação com o servidor.', 'erro');
    }
}

function atualizarSenha(event) {
    event.preventDefault();
    const nova = document.getElementById('novaSenha').value;
    const conf = document.getElementById('confirmaNovaSenha').value;
    if (nova !== conf) return mostrarToast('As senhas não coincidem.', 'erro');
    
    mostrarToast('Senha alterada com sucesso!', 'sucesso');
    event.target.reset();
    setTimeout(() => redirecionarDashboard(), 1500);
}

// ==========================================
// 7. PEDIDOS E LISTAGEM
// ==========================================
async function submitRequest(event) {
    event.preventDefault();
    let tipoServico = document.getElementById('selectTipoServico').value;
    if (tipoServico === 'Outros') tipoServico = document.getElementById('reqTipoServicoCustom').value;

    const endRua = document.getElementById('reqRua').value;
    const endNum = document.getElementById('reqNumero').value;
    const endBairro = document.getElementById('reqBairro').value;
    const endCidade = document.getElementById('reqCidade').value;
    const enderecoFormatado = `${endRua}, ${endNum} - ${endBairro}, ${endCidade}`;
    
    const idLogado = localStorage.getItem('idUsuarioLogado') || 1;

    const payload = {
        id_solicitante: Number(idLogado), 
        id_tipo_servico: 1, 
        cod_prestador: null, 
        data_servico: document.getElementById('reqData').value,
        horario: "A combinar",
        endereco: enderecoFormatado,
        descricao: `[${tipoServico}] ${document.getElementById('reqTitulo').value} - ${document.getElementById('reqDescricao').value}`,
        valor_combinado: 0
    };

    try {
        const resposta = await fetch(`${API_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok || resposta.status === 201) {
            mostrarToast('Serviço solicitado com sucesso!');
            event.target.reset();
            carregarMinhasSolicitacoes();
        } else {
            const resultado = await resposta.json();
            mostrarToast(resultado.erro || 'Falha ao solicitar serviço.', 'erro');
        }
    } catch (erro) { mostrarToast('Erro de ligação com o servidor.', 'erro'); }
}

async function carregarMinhasSolicitacoes() {
    showPage('minhas-solicitacoes');
    const lista = document.getElementById('lista-minhas-solicitacoes');
    if(!lista) return;

    lista.innerHTML = '<p style="color: var(--text-muted);">A carregar os seus pedidos...</p>';
    const idLogado = localStorage.getItem('idUsuarioLogado') || 1;

    try {
        const resposta = await fetch(`${API_URL}/solicitantes/${idLogado}/solicitacoes`);
        const dados = await resposta.json();
        
        if (resposta.ok && dados.length > 0) {
            lista.innerHTML = dados.map(sol => `
                <div style="background: var(--surface); border: 1px solid var(--border); border-left: 5px solid var(--primary); padding: 25px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 18px;">Pedido #${sol.id_solicitacao}</h3>
                    <p style="margin-bottom: 5px;"><strong>Data Pretendida:</strong> ${sol.data_servico.split('T')[0]}</p>
                    <p style="margin-bottom: 5px;"><strong>Endereço:</strong> ${sol.endereco}</p>
                    <p style="margin-bottom: 10px;"><strong>Descrição:</strong> ${sol.descricao}</p>
                    <p>Status: <span style="color: var(--success); font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 20px;">${sol.status}</span></p>
                </div>
            `).join('');
        } else { lista.innerHTML = '<p style="color: var(--text-muted);">Ainda não tem pedidos registados.</p>'; }
    } catch (erro) { lista.innerHTML = '<p style="color: var(--error);">Ocorreu um erro ao buscar os seus pedidos.</p>'; }
}

async function carregarPrestadoresDisponiveis() {
    showPage('providers');
    const container = document.getElementById('container-lista-prestadores');
    if (!container) return;

    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">A procurar profissionais na sua área...</p>';

    try {
        const resposta = await fetch(`${API_URL}/prestadores`);
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
                    <div class="provider-card">
                        <div style="display: flex; gap: 20px; align-items: center;">
                            ${avatarHtml}
                            <div class="provider-info">
                                <h3 style="color: var(--primary); margin-bottom: 4px; font-size: 18px;">${p.nome}</h3>
                                <p style="color: var(--text-muted); font-size: 15px; margin-bottom: 6px;">${profissao}</p>
                                <div style="display: flex; gap: 15px; font-size: 14px; color: var(--text-main);">
                                    <span style="color: #F59E0B;"><i class="fas fa-star"></i> 5.0</span>
                                    <span><i class="fas fa-map-marker-alt"></i> ${p.endereco_completo ? p.endereco_completo.split('-')[0] : 'Endereço Indisponível'}</span>
                                </div>
                                <div style="color: var(--success); font-weight: bold; margin-top: 8px;">Diária a partir de R$ ${valorMin}</div>
                            </div>
                        </div>
                        <button class="btn btn-outline-light" style="border: 2px solid var(--primary); color: var(--primary); font-weight: 600;" onclick="mostrarToast('A iniciar contacto com ${p.nome}...')">Ver Perfil</button>
                    </div>
                `;
            }).join('');
        } else { container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum profissional encontrado no momento.</p>'; }
    } catch (erro) { container.innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Falha ao carregar a lista de profissionais.</p>'; }
}

function filtrarCatalogoServicos() {
    const input = document.getElementById('inputBuscaCatalogo');
    if(!input) return;
    const termo = input.value.toLowerCase();
    const cards = document.querySelectorAll('.catalog-card');
    let encontrou = false;

    cards.forEach(card => {
        const nome = card.getAttribute('data-nome') || '';
        if (nome.includes(termo)) {
            card.style.display = 'flex';
            encontrou = true;
        } else {
            card.style.display = 'none';
        }
    });

    const semResultados = document.getElementById('semResultadosBusca');
    if(semResultados) semResultados.style.display = encontrou ? 'none' : 'block';
}

function solicitarServicoCatalogo(nomeServico) {
    showPage('request');
    const select = document.getElementById('selectTipoServico');
    if (!select) return;

    select.value = nomeServico;
    verificarOutroServico(select);
}