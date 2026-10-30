// ======================================================
// CONFIGURAÇÃO BASE DA API
// ======================================================
const API_BASE_URL = 'http://localhost:3000/api';

// ======================================================
// NAVEGAÇÃO ENTRE PÁGINAS (SPA)
// ======================================================
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// ======================================================
// EXIBIR / OCULTAR CAMPOS DO PRESTADOR NO CADASTRO
// ======================================================
function toggleCamposPrestador() {
    const tipo = document.getElementById('regTipo').value;
    const camposPrestador = document.getElementById('campos-prestador');
    
    if (camposPrestador) {
        if (tipo === 'prestador') {
            camposPrestador.style.display = 'grid';
        } else {
            camposPrestador.style.display = 'none';
        }
    }
}

// ======================================================
// CADASTRO DE USUÁRIOS (SOLICITANTE OU PRESTADOR)
// ======================================================
async function register(event) {
    event.preventDefault();

    const errorElement = document.getElementById('registerError');
    if (errorElement) errorElement.textContent = '';

    const tipo = document.getElementById('regTipo').value;
    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const cpf = document.getElementById('regCpf').value.trim();
    const rg = document.getElementById('regRg').value.trim();
    const data_nascimento = document.getElementById('regNascimento').value;
    const telefone = document.getElementById('regTelefone').value.trim();
    const estado_civil = document.getElementById('regEstadoCivil') ? document.getElementById('regEstadoCivil').value : 'Não informado';
    const endereco = document.getElementById('regEndereco').value.trim();
    const senha = document.getElementById('regSenha').value;
    const senha2 = document.getElementById('regSenha2').value;

    if (!tipo) {
        if (errorElement) errorElement.textContent = 'Por favor, selecione se deseja solicitar serviços ou ser prestador.';
        return;
    }

    if (senha !== senha2) {
        if (errorElement) errorElement.textContent = 'As senhas não coincidem!';
        return;
    }

    try {
        let endpoint = '';
        let payload = {};

        if (tipo === 'solicitante') {
            endpoint = `${API_BASE_URL}/solicitantes`;
            payload = {
                nome,
                cpf,
                rg,
                email,
                data_nascimento,
                telefone,
                senha,
                endereco,
                estado_civil
            };
        } else if (tipo === 'prestador') {
            endpoint = `${API_BASE_URL}/prestadores`;
            
            // Captação tratada de campos específicos do Prestador
            const regProfissao = document.getElementById('regProfissao');
            const regExperiencia = document.getElementById('regExperiencia');
            const regEscolaridade = document.getElementById('regEscolaridade');
            const regCnh = document.getElementById('regCnh');
            const regSexo = document.getElementById('regSexo');
            const regValorMin = document.getElementById('regValorMin');
            const regValorMax = document.getElementById('regValorMax');
            const regDisponibilidade = document.getElementById('regDisponibilidade');
            const regDescricaoFuncoes = document.getElementById('regDescricaoFuncoes');
            const regEquipamentos = document.getElementById('regEquipamentos');

            payload = {
                nome,
                email,
                cpf,
                rg,
                cnh: regCnh ? regCnh.value.trim() : '',
                sexo: regSexo ? regSexo.value : 'Não informado',
                data_nascimento,
                telefone,
                escolaridade: regEscolaridade ? regEscolaridade.value.trim() : 'Não informada',
                endereco_completo: endereco, // Mapeado para a coluna do banco de dados
                profissao_funcao: (regProfissao && regProfissao.value.trim()) ? regProfissao.value.trim() : 'Serviços Gerais',
                experiencia: regExperiencia ? regExperiencia.value : 'intermediário',
                descricao_funcoes: (regDescricaoFuncoes && regDescricaoFuncoes.value.trim()) ? regDescricaoFuncoes.value.trim() : 'Prestação de serviços gerais.',
                possui_equipamentos: regEquipamentos ? regEquipamentos.checked : true,
                valor_minimo: regValorMin ? parseFloat(regValorMin.value) || 50.00 : 50.00,
                valor_maximo: regValorMax ? parseFloat(regValorMax.value) || 200.00 : 200.00,
                antecedentes_criminais: 'Nada consta',
                disponibilidade_horario: (regDisponibilidade && regDisponibilidade.value.trim()) ? regDisponibilidade.value.trim() : 'A combinar'
            };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao realizar cadastro.');
        }

        alert('Conta criada com sucesso!');
        showPage('login');

    } catch (error) {
        if (errorElement) {
            errorElement.textContent = error.message;
        } else {
            alert('Erro: ' + error.message);
        }
    }
}

// ======================================================
// LOGIN DE USUÁRIO
// ======================================================
async function login(event) {
    event.preventDefault();

    const errorElement = document.getElementById('loginError');
    if (errorElement) errorElement.textContent = '';

    const usuario = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value;

    if (!usuario || !senha) {
        if (errorElement) errorElement.textContent = 'Preencha usuário e senha.';
        return;
    }

    try {
        // Redirecionamento temporário para o painel principal até a criação do middleware JWT
        alert(`Bem-vindo(a) de volta!`);
        showPage('dashboard');
    } catch (error) {
        if (errorElement) errorElement.textContent = error.message;
    }
}

// ======================================================
// CRIAÇÃO E ENVIO DE SOLICITAÇÃO DE SERVIÇO
// ======================================================
async function submitRequest(event) {
    event.preventDefault();

    const form = event.target;
    const tipoServicoSelect = form.querySelector('select');
    const tituloInput = form.querySelector('input[type="text"]');
    const descricaoTextarea = form.querySelector('textarea');
    const dataInput = form.querySelector('input[type="date"]');
    const enderecoInput = form.querySelectorAll('input[type="text"]')[1];

    const payload = {
        id_solicitante: 1, // ID temporário até integrar o ID do usuário logado
        id_tipo_servico: 1, // ID fixo de exemplo para testes da rota
        cod_prestador: 1,
        data_servico: dataInput ? dataInput.value : new Date().toISOString().split('T')[0],
        horario: '14:00',
        endereco: enderecoInput ? enderecoInput.value : 'Endereço padrão',
        descricao: descricaoTextarea ? descricaoTextarea.value : '',
        valor_combinado: 100.00
    };

    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao criar solicitação.');
        }

        alert('Solicitação realizada com sucesso!');
        showPage('dashboard');
    } catch (error) {
        alert('Erro ao solicitar serviço: ' + error.message);
    }
}

// ======================================================
// UPLOAD E SELEÇÃO DE FOTOS
// ======================================================
function mostrarFotos(input) {
    const info = document.getElementById('fotosInfo');
    if (info && input.files.length > 0) {
        info.textContent = `${input.files.length} foto(s) selecionada(s)`;
    }
}

function selectProvider(nomePrestador) {
    alert(`Você selecionou o perfil de: ${nomePrestador}`);
}

function verDetalhes() {
    alert('Detalhes do pedido em desenvolvimento.');
}

// ======================================================
// FUNÇÕES AUXILIARES DE TESTE DA API (PAINEL INTERNO)
// ======================================================
async function listar(endpoint, resultElementId) {
    const resContainer = document.getElementById(resultElementId);
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();
        if (resContainer) resContainer.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        if (resContainer) resContainer.textContent = 'Erro ao consultar: ' + error.message;
    }
}

async function cadastrarSolicitante() {
    const payload = {
        nome: document.getElementById('sol-nome').value,
        cpf: document.getElementById('sol-cpf').value,
        rg: document.getElementById('sol-rg').value,
        email: document.getElementById('sol-email').value,
        data_nascimento: document.getElementById('sol-data_nascimento').value,
        telefone: document.getElementById('sol-telefone').value,
        senha: document.getElementById('sol-senha').value,
        estado_civil: document.getElementById('sol-estado_civil').value,
        endereco: document.getElementById('sol-endereco').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/solicitantes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('res-solicitante').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('res-solicitante').textContent = 'Erro: ' + error.message;
    }
}

async function cadastrarPrestador() {
    const payload = {
        nome: document.getElementById('pres-nome').value,
        email: document.getElementById('pres-email').value,
        cpf: document.getElementById('pres-cpf').value,
        rg: document.getElementById('pres-rg').value,
        cnh: document.getElementById('pres-cnh').value,
        sexo: document.getElementById('pres-sexo').value,
        data_nascimento: document.getElementById('pres-data_nascimento').value,
        telefone: document.getElementById('pres-telefone').value,
        escolaridade: document.getElementById('pres-escolaridade').value,
        profissao_funcao: document.getElementById('pres-profissao_funcao').value,
        experiencia: document.getElementById('pres-experiencia').value,
        valor_minimo: parseFloat(document.getElementById('pres-valor_minimo').value),
        valor_maximo: parseFloat(document.getElementById('pres-valor_maximo').value),
        disponibilidade_horario: document.getElementById('pres-disponibilidade_horario').value,
        antecedentes_criminais: document.getElementById('pres-antecedentes_criminais').value,
        possui_equipamentos: document.getElementById('pres-possui_equipamentos').checked,
        endereco_completo: document.getElementById('pres-endereco_completo').value,
        descricao_funcoes: document.getElementById('pres-descricao_funcoes').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/prestadores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('res-prestador').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('res-prestador').textContent = 'Erro: ' + error.message;
    }
}

async function cadastrarTipoServico() {
    const payload = {
        nome: document.getElementById('ts-nome').value,
        descricao: document.getElementById('ts-descricao').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/servicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('res-tipo-servico').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('res-tipo-servico').textContent = 'Erro: ' + error.message;
    }
}

async function vincularPrestadorServico() {
    const codPrestador = document.getElementById('ps-cod_prestador').value;
    const payload = {
        id_tipo_servico: parseInt(document.getElementById('ps-id_tipo_servico').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/prestadores/${codPrestador}/servicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('res-prestador-servico').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('res-prestador-servico').textContent = 'Erro: ' + error.message;
    }
}

async function listarServicosDoPrestador() {
    const codPrestador = document.getElementById('ps-cod_prestador').value;
    listar(`/prestadores/${codPrestador}/servicos`, 'res-prestador-servico');
}

async function listarPrestadoresPorServico() {
    const idServico = document.getElementById('sp-id_tipo_servico').value;
    listar(`/servicos/${idServico}/prestadores`, 'res-servico-prestadores');
}

async function criarSolicitacao() {
    const payload = {
        id_solicitante: parseInt(document.getElementById('solic-id_solicitante').value),
        id_tipo_servico: parseInt(document.getElementById('solic-id_tipo_servico').value),
        cod_prestador: parseInt(document.getElementById('solic-cod_prestador').value),
        data_servico: document.getElementById('solic-data_servico').value,
        horario: document.getElementById('solic-horario').value,
        valor_combinado: parseFloat(document.getElementById('solic-valor_combinado').value),
        endereco: document.getElementById('solic-endereco').value,
        descricao: document.getElementById('solic-descricao').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('res-solicitacao').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('res-solicitacao').textContent = 'Erro: ' + error.message;
    }
}

async function listarSolicitacoesSolicitante() {
    const id = document.getElementById('solic-id_solicitante').value;
    listar(`/solicitantes/${id}/solicitacoes`, 'res-solicitacao');
}

async function listarSolicitacoesPrestador() {
    const id = document.getElementById('solic-cod_prestador').value;
    listar(`/prestadores/${id}/solicitacoes`, 'res-solicitacao');
}

async function alterarStatusSolicitacao() {
    const id = document.getElementById('solic-id_status').value;
    const payload = {
        status: document.getElementById('solic-novo_status').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('res-solicitacao').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('res-solicitacao').textContent = 'Erro: ' + error.message;
    }
}

// ======================================================
// INICIALIZAÇÃO APÓS O CARREGAMENTO DO DOM
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    // Garante que a página inicial ativa é 'home'
    showPage('home');
});