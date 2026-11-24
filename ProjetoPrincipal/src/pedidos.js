// ==========================================================================
// PEDIDOS.JS - Solicitações, Pedidos do Cliente, Agenda do Prestador e Avaliações
// Carregar nas páginas: solicitar.html, meus-pedidos.html, painel-prestador.html,
// avaliar-servico.html, avaliar-site.html e avaliacoes.html
// ==========================================================================

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

// Chamada específica para preencher CEP nos pedidos
function buscarEnderecoPorCep() {
    buscarCepGenerico('reqCep', 'reqRua', 'reqBairro', 'reqCidade', 'reqNumero');
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

    const renderizarLista = (lista) => lista.map(av => {
        const estrelasHTML = '⭐'.repeat(av.nota);
        return `
            <div style="background: #fff; border: 1px solid var(--border); padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                <div style="font-size: 20px; margin-bottom: 10px;">${estrelasHTML}</div>
                <p style="font-size: 16px; color: var(--text-main); font-style: italic; margin-bottom: 15px;">"${av.comentario}"</p>
                <h4 style="color: var(--primary); border-top: 1px solid var(--border); padding-top: 15px; font-size: 15px;">- ${av.nome_usuario}</h4>
            </div>
        `;
    }).join('');

    try {
        const resposta = await fetch(`${API_URL}/avaliacoes-site`, { cache: 'no-store' });
        let avaliacoesReais = [];
        if (resposta.ok) {
            avaliacoesReais = await resposta.json();
        }

        const todasAvaliacoes = [...avaliacoesReais, ...avaliacoesMock];
        container.innerHTML = todasAvaliacoes.length > 0
            ? renderizarLista(todasAvaliacoes)
            : '<p style="text-align:center; color: var(--text-muted);">Ainda não há avaliações sobre a plataforma.</p>';
    } catch (e) {
        container.innerHTML = renderizarLista(avaliacoesMock);
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

// Inicialização específica das páginas de pedidos, agenda e avaliações
document.addEventListener('DOMContentLoaded', () => {
    const paginaAtual = document.body.getAttribute('data-page') || '';
    const params = new URLSearchParams(window.location.search);

    if (paginaAtual === 'request') {
        inicializarPaginaSolicitar();
    } else if (paginaAtual === 'minhas-solicitacoes') {
        carregarMinhasSolicitacoes();
    } else if (paginaAtual === 'dashboard-prestador') {
        const aba = params.get('aba');
        if (aba === 'oportunidades') carregarOportunidadesPrestador();
        else if (aba === 'agenda') carregarAgendaPrestador();
        else if (aba === 'concluidos') carregarConcluidosPrestador();
    } else if (paginaAtual === 'avaliacao') {
        const idSol = params.get('id');
        const campoId = document.getElementById('idSolicitacaoAvaliacao');
        if (campoId && idSol) campoId.value = idSol;
    } else if (paginaAtual === 'avaliacoes') {
        abrirTelaAvaliacoesSite();
    }
});
