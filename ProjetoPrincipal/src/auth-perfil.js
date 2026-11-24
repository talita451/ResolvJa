// ==========================================================================
// AUTH-PERFIL.JS - Login, Cadastro, Formas de Pagamento e Meu Perfil
// Carregar nas páginas: login.html, cadastro.html e meu-perfil.html
// ==========================================================================

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

// Chamada específica para preencher CEP no cadastro
function buscarCepCadastro() {
    buscarCepGenerico('regCep', 'regRua', 'regBairro', 'regCidade', 'regNumero');
}

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

// Inicialização específica das páginas de cadastro e perfil
document.addEventListener('DOMContentLoaded', () => {
    const paginaAtual = document.body.getAttribute('data-page') || '';
    const params = new URLSearchParams(window.location.search);

    if (paginaAtual === 'meu-perfil') {
        carregarDadosPerfil();
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
