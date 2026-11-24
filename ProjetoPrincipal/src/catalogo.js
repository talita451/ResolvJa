// ==========================================================================
// CATALOGO.JS - Catálogo de Serviços, Profissionais e Perfil do Prestador
// Carregar nas páginas: catalogo.html, profissionais.html e perfil-prestador.html
// ==========================================================================

// Função: Redireciona o utilizador para a página solicitar.html com o serviço escolhido
function solicitarServicoCatalogo(nomeServico, codPrestador = null) {
    const params = new URLSearchParams();
    if (nomeServico) params.set('servico', nomeServico);
    if (codPrestador) params.set('prestador', codPrestador);
    const qs = params.toString() ? `?${params.toString()}` : '';
    showPage('request', qs);
}

// Função: Carrega todos os serviços do banco e aplica as imagens locais / inteligentes
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

            // Foto inicial segura enquanto o sistema inteligente verifica a pasta local e o fallback
            const fotoInicial = (typeof window.obterImagemServico === 'function')
                ? window.obterImagemServico(servico)
                : 'assets/servicos/faxina-limpeza-residencial.jpg';

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

            // Aplica a imagem local em assets/servicos/ ou fallback inteligente da categoria
            const divImg = card.querySelector('.catalog-img');
            if (typeof window.aplicarFotoInteligenteNoCard === 'function') {
                window.aplicarFotoInteligenteNoCard(divImg, servico);
            }

            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar o catálogo de serviços:", erro);
        container.innerHTML = '<p class="error-msg">Erro ao carregar os serviços do banco de dados. Verifique se o servidor está ligado.</p>';
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

// Inicialização específica das páginas de catálogo e prestadores
document.addEventListener('DOMContentLoaded', () => {
    const paginaAtual = document.body.getAttribute('data-page') || '';
    const params = new URLSearchParams(window.location.search);

    if (paginaAtual === 'catalogo-completo') {
        carregarCatalogoServicosCompleto();
    } else if (paginaAtual === 'providers') {
        carregarPrestadoresDisponiveis();
    } else if (paginaAtual === 'detalhe-prestador') {
        const idPrestador = params.get('id');
        if (idPrestador) verPerfilPrestador(idPrestador);
    }
});
