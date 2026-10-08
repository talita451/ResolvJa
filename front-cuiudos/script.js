/*
      TROCA DE PÁGINAS
    */

      function showPage(pageId) {

        const pages = document.querySelectorAll(".page");
  
        pages.forEach(function(page) {
          page.classList.remove("active");
        });
  
        const selectedPage = document.getElementById(pageId);
  
        if (selectedPage) {
          selectedPage.classList.add("active");
        }
  
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
  
  
      /*
        LOGIN
      */
  
  
  
      /*
        ENVIO DA SOLICITAÇÃO
      */
  
      function submitRequest(event) {
  
        event.preventDefault();
  
        alert(
          "Solicitação criada com sucesso! Agora escolha um prestador."
        );
  
        showPage("providers");
      }
  
  
      /*
        ESCOLHER PRESTADOR
      */
  
      function selectProvider(name) {
  
        const confirmChoice = confirm(
          "Deseja contratar " + name + "?"
        );
  
        if (confirmChoice) {
  
          alert(
            "Prestador " +
            name +
            " selecionado com sucesso!"
          );
  
          showPage("dashboard");
  
        }
  
      }
  
  
      /*
        FILTROS
      */
  
      const filters = document.querySelectorAll(".filter");
  
      filters.forEach(function(filter) {
  
        filter.addEventListener("click", function() {
  
          filters.forEach(function(item) {
            item.classList.remove("active");
          });
  
          this.classList.add("active");
  
        });
  
      });
  
      /*
    CADASTRO
  */
  
  
  
  /*
    ORDENAÇÃO DOS PRESTADORES
  */
  
  function sortProviders(key) {
    const list = document.querySelector(".providers-list");
    if (!list) return;
    const cards = Array.from(list.querySelectorAll(".provider-card"));
    const cmp = {
      rating: (a, b) => Number(b.dataset.rating) - Number(a.dataset.rating),
      dist: (a, b) => Number(a.dataset.dist) - Number(b.dataset.dist),
      price: (a, b) => Number(a.dataset.price) - Number(b.dataset.price)
    }[key] || ((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    cards.sort(cmp).forEach(card => list.appendChild(card));
  }
  
  document.querySelectorAll(".filter").forEach(function(btn) {
    btn.addEventListener("click", function() {
      sortProviders(this.dataset.sort);
    });
  });
  
  
  /*
    DETALHES DO PEDIDO
  */
  
  function verDetalhes() {
    alert(
      "Solicitação #00124\n" +
      "Serviço: Troca de torneira\n" +
      "Status: Em andamento\n" +
      "Data: Hoje, 14:30"
    );
  }
  
  
  /*
    FOTOS DO PROBLEMA
  */
  
  function mostrarFotos(input) {
    const info = document.getElementById("fotosInfo");
    const files = Array.from(input.files || []);
    const validos = files.filter(f => /^image\/(jpeg|png)$/.test(f.type));
    if (files.length === 0) {
      info.textContent = "Opcional • JPG ou PNG";
    } else if (validos.length !== files.length) {
      info.textContent = validos.length + " de " + files.length + " arquivo(s) válido(s) (somente JPG ou PNG)";
    } else {
      info.textContent = validos.length + " foto(s) selecionada(s)";
    }
  }
  
    
  
      function apiBase() {
        return document.getElementById('api-base').value.trim().replace(/\/+$/, '');
      }
  
      async function enviarRequisicao(endpoint, method = 'GET', body = null) {
        const config = {
          method,
          headers: { 'Content-Type': 'application/json' }
        };
        if (body) config.body = JSON.stringify(body);
  
        try {
          const res = await fetch(`${apiBase()}${endpoint}`, config);
          const text = await res.text();
          let data;
          try { data = JSON.parse(text); } catch (e) { data = text || '(resposta vazia)'; }
          const corpo = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
          return `HTTP ${res.status}\n` + corpo;
        } catch (err) {
          return `Erro ao conectar com a API: ${err.message}`;
        }
      }
  
      async function listar(endpoint, elementId) {
        document.getElementById(elementId).innerText = 'A carregar...';
        const res = await enviarRequisicao(endpoint, 'GET');
        document.getElementById(elementId).innerText = res;
      }
  
      // 1. Solicitante
      async function cadastrarSolicitante() {
        const payload = {
          nome: document.getElementById('sol-nome').value,
          cpf: document.getElementById('sol-cpf').value,
          rg: document.getElementById('sol-rg').value,
          email: document.getElementById('sol-email').value,
          data_nascimento: document.getElementById('sol-data_nascimento').value,
          telefone: document.getElementById('sol-telefone').value,
          senha: document.getElementById('sol-senha').value,
          endereco: document.getElementById('sol-endereco').value,
          estado_civil: document.getElementById('sol-estado_civil').value
        };
        const res = await enviarRequisicao('/solicitantes', 'POST', payload);
        document.getElementById('res-solicitante').innerText = res;
      }
  
      // 2. Prestador
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
          endereco_completo: document.getElementById('pres-endereco_completo').value,
          profissao_funcao: document.getElementById('pres-profissao_funcao').value,
          experiencia: document.getElementById('pres-experiencia').value,
          descricao_funcoes: document.getElementById('pres-descricao_funcoes').value,
          possui_equipamentos: document.getElementById('pres-possui_equipamentos').checked,
          valor_minimo: Number(document.getElementById('pres-valor_minimo').value),
          valor_maximo: Number(document.getElementById('pres-valor_maximo').value),
          antecedentes_criminais: document.getElementById('pres-antecedentes_criminais').value,
          disponibilidade_horario: document.getElementById('pres-disponibilidade_horario').value
        };
        const res = await enviarRequisicao('/prestadores', 'POST', payload);
        document.getElementById('res-prestador').innerText = res;
      }
  
      // 3. Tipos de Serviço
      async function cadastrarTipoServico() {
        const payload = {
          nome: document.getElementById('ts-nome').value,
          descricao: document.getElementById('ts-descricao').value
        };
        const res = await enviarRequisicao('/servicos', 'POST', payload);
        document.getElementById('res-tipo-servico').innerText = res;
      }
  
      // 4. Vincular e listar serviços do prestador
      async function vincularPrestadorServico() {
        const id = document.getElementById('ps-cod_prestador').value;
        const payload = {
          id_tipo_servico: Number(document.getElementById('ps-id_tipo_servico').value)
        };
        const res = await enviarRequisicao(`/prestadores/${id}/servicos`, 'POST', payload);
        document.getElementById('res-prestador-servico').innerText = res;
      }
  
      async function listarServicosDoPrestador() {
        const id = document.getElementById('ps-cod_prestador').value;
        const res = await enviarRequisicao(`/prestadores/${id}/servicos`, 'GET');
        document.getElementById('res-prestador-servico').innerText = res;
      }
  
      // 5. Prestadores por serviço
      async function listarPrestadoresPorServico() {
        const id = document.getElementById('sp-id_tipo_servico').value;
        const res = await enviarRequisicao(`/servicos/${id}/prestadores`, 'GET');
        document.getElementById('res-servico-prestadores').innerText = res;
      }
  
      // 6. Solicitações
      async function criarSolicitacao() {
        const payload = {
          id_solicitante: Number(document.getElementById('solic-id_solicitante').value),
          id_tipo_servico: Number(document.getElementById('solic-id_tipo_servico').value),
          cod_prestador: Number(document.getElementById('solic-cod_prestador').value),
          data_servico: document.getElementById('solic-data_servico').value,
          horario: document.getElementById('solic-horario').value,
          endereco: document.getElementById('solic-endereco').value,
          descricao: document.getElementById('solic-descricao').value,
          valor_combinado: Number(document.getElementById('solic-valor_combinado').value)
        };
        const res = await enviarRequisicao('/solicitacoes', 'POST', payload);
        document.getElementById('res-solicitacao').innerText = res;
      }
  
      async function listarSolicitacoesSolicitante() {
        const id = document.getElementById('solic-id_solicitante').value;
        const res = await enviarRequisicao(`/solicitantes/${id}/solicitacoes`, 'GET');
        document.getElementById('res-solicitacao').innerText = res;
      }
  
      async function listarSolicitacoesPrestador() {
        const id = document.getElementById('solic-cod_prestador').value;
        const res = await enviarRequisicao(`/prestadores/${id}/solicitacoes`, 'GET');
        document.getElementById('res-solicitacao').innerText = res;
      }
  
      async function alterarStatusSolicitacao() {
        const id = document.getElementById('solic-id_status').value;
        const payload = {
          status: document.getElementById('solic-novo_status').value
        };
        const res = await enviarRequisicao(`/solicitacoes/${id}/status`, 'PUT', payload);
        document.getElementById('res-solicitacao').innerText = res;
      }
    
    
  
    /* =========================================================
       LOGIN E CADASTRO (ligados à API)
       Base da API: campo "URL base da API" da aba de cadastro.
    ========================================================= */
  
    const ROTA_CADASTRO = {
      solicitante: "/solicitantes",
      prestador: "/prestadores"
    };
  
    function mostrarErro(idElemento, texto) {
      document.getElementById(idElemento).textContent = texto;
    }
  
    async function chamarApi(caminho, dados) {
      let res;
      try {
        res = await fetch(apiBase() + caminho, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });
      } catch (err) {
        throw new Error("Não foi possível conectar com a API em " + apiBase() + ".");
      }
  
      const texto = await res.text();
      let corpo = {};
      try { corpo = texto ? JSON.parse(texto) : {}; } catch (e) { corpo = { message: texto }; }
  
      if (!res.ok) {
        const msg = corpo.error || corpo.message || ("Erro " + res.status + " da API.");
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      return corpo;
    }
  
    async function login(event) {
      event.preventDefault();
      mostrarErro("loginError", "");
  
      const usuario = document.getElementById("loginUsuario").value.trim();
      const senha = document.getElementById("loginSenha").value;
  
      if (!usuario || !senha) {
        mostrarErro("loginError", "Informe usuário e senha.");
        return;
      }
  
      try {
        const dados = await chamarApi("/login", { usuario: usuario, senha: senha });
        sessionStorage.setItem("resolvaja_usuario", JSON.stringify({
          usuario: usuario,
          token: dados.token || null
        }));
        document.getElementById("form-login").reset();
        showPage("dashboard");
      } catch (err) {
        mostrarErro("loginError", err.message);
      }
    }
  
    async function register(event) {
      event.preventDefault();
      mostrarErro("registerError", "");
  
      const form = document.getElementById("form-cadastro");
      const obrigatorios = Array.from(form.querySelectorAll("[required]"));
      if (obrigatorios.some(c => !c.value.trim())) {
        mostrarErro("registerError", "Preencha todos os campos obrigatórios.");
        return;
      }
  
      const senha = document.getElementById("regSenha").value;
      const senha2 = document.getElementById("regSenha2").value;
      if (senha.length < 6) {
        mostrarErro("registerError", "A senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (senha !== senha2) {
        mostrarErro("registerError", "As senhas não conferem.");
        return;
      }
  
      const tipo = document.getElementById("regTipo").value;
      const dados = {
        nome: document.getElementById("regNome").value.trim(),
        usuario: document.getElementById("regUsuario").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        cpf: document.getElementById("regCpf").value.trim(),
        data_nascimento: document.getElementById("regNascimento").value,
        telefone: document.getElementById("regTelefone").value.trim(),
        endereco: document.getElementById("regEndereco").value.trim(),
        senha: senha
      };
  
      try {
        await chamarApi(ROTA_CADASTRO[tipo], dados);
        alert("Conta criada com sucesso! Faça login para continuar.");
        form.reset();
        showPage("login");
      } catch (err) {
        mostrarErro("registerError", err.message);
      }
    }
    
  