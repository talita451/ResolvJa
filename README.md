# 🛠️ ResolvJá — Plataforma de Serviços Locais

O **ResolvJá** é uma aplicação web *full-stack* desenvolvida para conectar **clientes (solicitantes)** que precisam de serviços domésticos, reparos e assistências a **profissionais locais (prestadores)** de forma prática, rápida e transparente.

---

## 🎯 Principais Funcionalidades

* **Cadastro Unificado e Alternância de Perfil:** Um mesmo usuário pode atuar como **Cliente** ou **Prestador**, alternando entre os dois painéis diretamente pelo menu da conta sem precisar criar outro cadastro.
* **Catálogo Dinâmico de Serviços:** Carregado diretamente do banco de dados PostgreSQL, com barra de pesquisa em tempo real, imagens locais dedicadas e aviso transparente de que o valor final está sujeito a alterações conforme o serviço prestado.
* **Fluxo Completo de Pedidos:** Solicitação de serviço com preenchimento automático de endereço via CEP, aceite/recusa pelo prestador, acompanhamento de status (`Pendente` → `Aceito` → `A Caminho` → `Concluído` ou `Cancelado`) e modal *"Solicitar serviço novamente?"* após cancelamentos.
* **Avaliações com Estrelas, Foto e Resposta:** Após a conclusão do serviço, o cliente pode dar nota de 1 a 5 estrelas, escrever um comentário e enviar uma foto opcional; o prestador pode responder publicamente à avaliação.
* **Avaliação da Plataforma:** Mural público onde os usuários avaliam a experiência geral com o site ResolvJá.
* **Upload de Imagens em Pasta Local:** Fotos de perfil e de avaliações são salvas fisicamente na pasta `/uploads` do servidor, armazenando apenas o caminho público no banco de dados.
* **Modo Escuro / Claro e Responsividade:** Alternância de tema salva no navegador e layout adaptado para computadores e celulares.

---

## 🧰 Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (variáveis CSS para Modo Claro/Escuro), JavaScript Modular (ES6+) e FontAwesome 6.
* **Back-end:** Node.js e Express.
* **Banco de Dados:** PostgreSQL na nuvem via **Neon DB** (driver `pg`).
* **Segurança e Configuração:** Criptografia de senhas com `bcryptjs`, `cors` e variáveis de ambiente com `dotenv`.
* **Testes Automatizados:** **Jest** (Caixa Branca / Testes Unitários) e **Supertest** (Caixa Preta / Testes de API).

---

## 📁 Estrutura de Pastas do Projeto

```text
ProjetoPrincipal/
├── assets/                     # Imagens estáticas: logos (claro/escuro), favicon, vídeo da Home, fotos da equipe e dos serviços
│   ├── equipe/                 # Fotos dos integrantes (daiane, eduardo, kauan, layla, paola, talita)
│   └── servicos/               # Imagens locais dos cards do catálogo de serviços
├── uploads/                    # Fotos enviadas pelos usuários (perfil e avaliações) salvas pelo servidor
├── src/
│   ├── controllers/            # Camada que recebe as requisições HTTP, valida dados e retorna respostas JSON
│   ├── repositories/           # Camada que executa as consultas SQL (SELECT, INSERT, UPDATE) no PostgreSQL
│   ├── routes/                 # Definição de todas as rotas da API sob o prefixo /ResolvJa
│   ├── middlewares/            # Tratamento centralizado de erros (errorHandler.js)
│   ├── utils/                  # Funções utilitárias do back-end (salvarImagem.js)
│   ├── global.js               # Configurações globais do front-end (API, tema, menu, sessão, CEP, modais)
│   ├── auth-perfil.js          # Lógica de cadastro, login e atualização de perfil
│   ├── catalogo.js             # Catálogo dinâmico, busca de serviços e vitrine/perfil de prestadores
│   ├── pedidos.js              # Ciclo de vida dos pedidos, agenda do prestador e avaliações
│   ├── imagens.js              # Leitura e conversão de imagens para Base64 no front-end
│   ├── imagens-servicos.js     # Mapeamento dos nomes de serviços para as imagens de assets/servicos/
│   ├── Avisos.js               # Controle de avisos e notificações de interface
│   └── clique.js               # Efeitos visuais de clique na interface
├── tests/                      # Suítes de testes automatizados (Jest + Supertest)
│   ├── salvarImagem.test.js    # Teste de Caixa Branca do utilitário de upload
│   ├── regrasResolvJa.test.js  # Teste de Caixa Branca das regras de negócio e bcryptjs
│   └── apiResolvJa.test.js     # Teste de Caixa Preta das rotas reais da API
├── *.html                      # 17 páginas HTML independentes
├── style.css                   # Estilos globais, responsividade mobile e Dark Mode
├── banco.js                    # Pool de conexão com o PostgreSQL (Neon DB)
├── server.js                   # Arquivo principal do servidor Express
├── package.json                # Dependências e scripts (start, dev, test)
└── .env                        # Variáveis sensíveis (DATABASE_URL, PORT) — não enviar ao GitHub
```

---

## 🗄️ Banco de Dados (PostgreSQL / Neon DB)

O banco de dados do ResolvJá está estruturado em **6 tabelas** no schema `public`, garantindo organização e integridade referencial.

### 1. Tabela `solicitante` (Clientes)
Armazena os dados cadastrais dos clientes que contratam serviços.

| Coluna | Tipo | Nulo? | Descrição |
| :--- | :--- | :---: | :--- |
| `id_solicitante` | `INTEGER` (PK) | Não | Identificador único do cliente. |
| `nome` | `VARCHAR` | Não | Nome completo do cliente. |
| `cpf` | `VARCHAR` | Não | CPF (não editável após o cadastro). |
| `rg` | `VARCHAR` | Não | RG (não editável após o cadastro). |
| `email` | `VARCHAR` | Não | E-mail de acesso e contato. |
| `data_nascimento` | `DATE` | Não | Data de nascimento (não editável). |
| `telefone` | `VARCHAR` | Não | Telefone / WhatsApp. |
| `senha` | `VARCHAR` | Não | Senha criptografada com `bcryptjs`. |
| `endereco` | `TEXT` | Não | Endereço completo. |
| `estado_civil` | `VARCHAR` | Sim | Estado civil (opcional). |
| `foto_perfil` | `TEXT` | Sim | Caminho da foto salva em `/uploads/...`. |
| `criado_em` | `TIMESTAMP` | Sim | Data e hora do cadastro (`CURRENT_TIMESTAMP`). |

---

### 2. Tabela `prestador` (Profissionais)
Armazena os dados pessoais, profissionais e financeiros dos prestadores de serviço.

| Coluna | Tipo | Nulo? | Descrição |
| :--- | :--- | :---: | :--- |
| `cod_prestador` | `INTEGER` (PK) | Não | Identificador único do prestador. |
| `nome` | `VARCHAR` | Não | Nome completo do profissional. |
| `email` | `VARCHAR` | Não | E-mail de login e contato. |
| `cpf` / `rg` | `VARCHAR` | Não | Documentos de identificação. |
| `cnh` / `sexo` / `escolaridade` | `VARCHAR` | Sim | Informações complementares opcionais. |
| `data_nascimento` | `DATE` | Não | Data de nascimento. |
| `telefone` | `VARCHAR` | Não | Telefone / WhatsApp. |
| `endereco_completo` | `TEXT` | Não | Endereço do profissional. |
| `profissao_funcao` | `VARCHAR` | Não | Profissão principal (ex.: Eletricista, Encanador). |
| `experiencia` | `VARCHAR` | Sim | Tempo de experiência informado. |
| `descricao_funcoes` | `TEXT` | Sim | Descrição detalhada dos serviços prestados. |
| `possui_equipamentos` | `BOOLEAN` | Não | Indica se possui ferramentas próprias. |
| `valor_minimo` / `valor_maximo` | `NUMERIC` | Não | Faixa de preço de referência cobrada. |
| `antecedentes_criminais` | `TEXT` | Sim | Informação complementar de segurança. |
| `disponibilidade_horario` | `VARCHAR` | Não | Dias e horários disponíveis para atendimento. |
| `formas_pagamento` | `VARCHAR` | Sim | Formas de pagamento aceitas (PIX, Dinheiro, Cartão etc.). |
| `senha` | `VARCHAR` | Sim | Senha criptografada com `bcryptjs`. |
| `foto_perfil` | `TEXT` | Sim | Caminho da foto salva em `/uploads/...`. |
| `criado_em` | `TIMESTAMP` | Sim | Data e hora do cadastro. |

---

### 3. Tabela `tipo_servico` (Catálogo de Serviços)
Armazena todas as categorias de serviços disponíveis para contratação no catálogo.

| Coluna | Tipo | Nulo? | Descrição |
| :--- | :--- | :---: | :--- |
| `id_tipo_servico` | `INTEGER` (PK) | Não | Identificador único do tipo de serviço. |
| `nome` | `VARCHAR` | Não | Nome do serviço (ex.: Eletricista, Pintura, Jardinagem). |
| `descricao` | `TEXT` | Sim | Breve explicação do serviço. |
| `ativo` | `BOOLEAN` | Sim | Define se o serviço está visível (`true` por padrão). |
| `preco_a_partir` | `NUMERIC` | Sim | Preço inicial de referência (`50.00` por padrão). |
| `categoria` | `VARCHAR` | Sim | Agrupamento do serviço (`'Geral'` por padrão). |
| `imagem_url` / `foto` | `TEXT` | Sim | Caminho ou URL da imagem do card. |
| `criado_em` | `TIMESTAMP` | Sim | Data de criação do registro. |

---

### 4. Tabela `prestador_servico` (Tabela Associativa N:N)
Resolve o relacionamento muitos-para-muitos entre `prestador` e `tipo_servico` (um prestador pode realizar vários serviços e um serviço pode ter vários prestadores).

| Coluna | Tipo | Nulo? | Descrição |
| :--- | :--- | :---: | :--- |
| `id_prestador_servico` | `INTEGER` (PK) | Não | Identificador do vínculo. |
| `cod_prestador` | `INTEGER` (FK) | Não | Referência ao prestador (`prestador.cod_prestador`). |
| `id_tipo_servico` | `INTEGER` (FK) | Não | Referência ao serviço (`tipo_servico.id_tipo_servico`). |
| `ativo` | `BOOLEAN` | Sim | Indica se o vínculo está ativo (`true` por padrão). |

---

### 5. Tabela `solicitacao` (Pedidos e Avaliações)
Registra todo o ciclo de vida de um pedido: abertura, execução, cancelamento e avaliação final.

| Coluna | Tipo | Nulo? | Descrição |
| :--- | :--- | :---: | :--- |
| `id_solicitacao` | `INTEGER` (PK) | Não | Número único do pedido. |
| `id_solicitante` | `INTEGER` (FK) | Não | Cliente que abriu o pedido (`solicitante.id_solicitante`). |
| `id_tipo_servico` | `INTEGER` (FK) | Não | Serviço solicitado (`tipo_servico.id_tipo_servico`). |
| `cod_prestador` | `INTEGER` (FK) | Sim | Prestador que aceitou o pedido (`prestador.cod_prestador`). |
| `data_servico` | `DATE` | Não | Data agendada para o atendimento. |
| `horario` | `VARCHAR` | Não | Horário agendado. |
| `endereco` | `TEXT` | Não | Endereço onde o serviço será executado. |
| `descricao` | `TEXT` | Sim | Detalhes adicionais informados pelo cliente. |
| `valor_combinado` | `NUMERIC` | Sim | Valor acertado diretamente entre cliente e prestador. |
| `forma_pagamento` | `VARCHAR` | Sim | Forma de pagamento escolhida. |
| `status` | `VARCHAR` | Sim | Status atual (`Pendente`, `Aceito`, `A Caminho`, `Concluído`, `Cancelado`). |
| `nota_avaliacao` | `INTEGER` | Sim | Nota de 1 a 5 estrelas dada pelo cliente. |
| `comentario_avaliacao` | `TEXT` | Sim | Comentário do cliente sobre o serviço. |
| `foto_avaliacao` | `TEXT` | Sim | Caminho da foto opcional do serviço concluído. |
| `resposta_avaliacao` | `TEXT` | Sim | Resposta do prestador à avaliação recebida. |
| `motivo_cancelamento` | `TEXT` | Sim | Motivo registrado em caso de cancelamento. |
| `criado_em` | `TIMESTAMP` | Sim | Data e hora da criação do pedido. |

---

### 6. Tabela `avaliacao_site` (Depoimentos sobre o ResolvJá)
Armazena as avaliações gerais que os usuários deixam sobre a plataforma.

| Coluna | Tipo | Nulo? | Descrição |
| :--- | :--- | :---: | :--- |
| `id_avaliacao` | `INTEGER` (PK) | Não | Identificador sequencial da avaliação. |
| `id_usuario` | `INTEGER` | Sim | ID do usuário que publicou o depoimento. |
| `nome_usuario` | `VARCHAR` | Sim | Nome exibido no card de depoimento. |
| `nota` | `INTEGER` | Não | Nota de 1 a 5 estrelas. |
| `comentario` | `TEXT` | Sim | Texto do depoimento. |
| `criado_em` | `TIMESTAMP` | Sim | Data e hora da publicação. |

---

### 🔗 Relacionamentos do Banco (5 Chaves Estrangeiras)

| # | Tabela de Origem | Coluna de Origem | Tabela de Destino | Coluna de Destino | Significado na Regra de Negócio |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `solicitacao` | `id_solicitante` | `solicitante` | `id_solicitante` | Todo pedido pertence a um cliente válido. |
| 2 | `solicitacao` | `id_tipo_servico` | `tipo_servico` | `id_tipo_servico` | Todo pedido referencia uma categoria do catálogo. |
| 3 | `solicitacao` | `cod_prestador` | `prestador` | `cod_prestador` | Associa o pedido ao profissional que o aceitou. |
| 4 | `prestador_servico` | `cod_prestador` | `prestador` | `cod_prestador` | Vincula um prestador aos serviços que ele oferece. |
| 5 | `prestador_servico` | `id_tipo_servico` | `tipo_servico` | `id_tipo_servico` | Vincula um serviço aos prestadores habilitados. |

---

## ⚙️ Arquitetura do Back-end (Node.js + Express)

O back-end segue uma **arquitetura em camadas** para separar responsabilidades e facilitar a manutenção:

1. **`server.js` (Ponto de Entrada):** Configura o Express, habilita `cors`, libera o limite de JSON para envio de imagens, serve os arquivos estáticos do site e a pasta `/uploads`, registra as rotas sob `/ResolvJa`, aplica o `errorHandler` e exporta o `app` (para permitir testes com Supertest).
2. **`banco.js` (Conexão com o Banco):** Cria o `Pool` de conexões com o PostgreSQL no **Neon DB** usando a variável `DATABASE_URL` do `.env` com SSL ativado.
3. **`src/routes/` (Rotas):** Mapeia cada URL da API (`/ResolvJa/status-banco`, `/ResolvJa/servicos`, `/ResolvJa/prestadores`, `/ResolvJa/solicitantes`, `/ResolvJa/solicitacoes`, `/ResolvJa/login`, `/ResolvJa/avaliacoes-site`, etc.) para o controller correspondente.
4. **`src/controllers/` (Controladores):** Recebem os dados enviados pelo front-end (`req.body`, `req.params`), aplicam regras de negócio (como criptografar senha com `bcryptjs`, salvar fotos com `salvarImagemEmPasta` e validar campos obrigatórios) e devolvem os status HTTP adequados (`200`, `201`, `400`, `401`, `404`, `500`).
5. **`src/repositories/` (Repositórios):** Concentram todas as queries SQL (`SELECT`, `INSERT`, `UPDATE`) executadas no PostgreSQL, mantendo o SQL isolado da lógica das rotas.
6. **`src/middlewares/errorHandler.js`:** Intercepta erros inesperados nas rotas e devolve uma resposta JSON padronizada sem derrubar o servidor.
7. **`src/utils/salvarImagem.js`:** Recebe uma imagem em Base64 enviada pelo front-end, valida o formato, converte para arquivo físico dentro da pasta `uploads/` com nome único e devolve o caminho público (`/uploads/nome_arquivo.png`) para ser salvo no banco.

---

## 🖥️ Páginas do Front-end (17 Arquivos HTML)

Todas as páginas compartilham a mesma barra de navegação (`navbar`), botão de **Modo Escuro/Claro**, menu dropdown do usuário (com miniatura ampliável em modal) e rodapé.

1. **`index.html` (Home):** Vídeo de fundo, chamada principal, cards informativos para Clientes, Prestadores e Avaliações, seção de Missão/Visão/Valores e banner de acesso ao SAC.
2. **`login.html` (Entrar):** Formulário de autenticação por usuário/e-mail e senha.
3. **`cadastro.html` (Criar Conta):** Formulário unificado. Ao selecionar *Prestador*, exibe automaticamente os campos profissionais (profissão, experiência, valor mínimo/máximo, disponibilidade, foto obrigatória e checkboxes de formas de pagamento). Possui busca automática de endereço por CEP.
4. **`catalogo.html` (Catálogo de Serviços):** Exibe todos os serviços vindos do banco de dados com barra de busca instantânea e aviso sobre variação do valor final.
5. **`solicitar.html` (Solicitar Serviço):** Formulário para o cliente agendar um serviço escolhendo categoria, data, horário, endereço (com CEP) e descrição.
6. **`painel-cliente.html` (Painel do Cliente):** Área logada inicial do solicitante com atalhos rápidos para novo pedido, meus pedidos e busca de profissionais.
7. **`meus-pedidos.html` (Meus Pedidos):** Lista todas as solicitações do cliente, mostra o status atualizado, permite avaliar serviços concluídos e cancelar pedidos aceitos (exibindo o modal *"Solicitar serviço novamente?"*).
8. **`painel-prestador.html` (Painel do Prestador):** Área logada do profissional dividida em *Oportunidades disponíveis*, *Minha Agenda* (serviços aceitos / a caminho) e *Concluídos* (com opção de responder avaliações).
9. **`profissionais.html` (Profissionais):** Vitrine com todos os prestadores cadastrados, profissão, faixa de preço e botão para visitar o perfil.
10. **`perfil-prestador.html` (Perfil do Prestador):** Página pública de um profissional com foto, experiência, disponibilidade, formas de pagamento aceitas e avaliações recebidas.
11. **`meu-perfil.html` (Atualizar Cadastro):** Permite editar dados de contato, endereço, profissão, formas de pagamento e trocar a foto de perfil com prévia redonda imediata. Campos sensíveis (`CPF`, `RG` e `Data de Nascimento`) ficam bloqueados (`disabled`).
12. **`atualizar-senha.html` (Alterar Senha):** Tela dedicada para atualização de senha da conta.
13. **`avaliar-servico.html` (Avaliar Serviço):** Formulário pós-atendimento com seleção interativa de 1 a 5 estrelas, comentário e upload opcional de foto do resultado.
14. **`avaliar-site.html` (Avalie o ResolvJá):** Formulário para o usuário publicar uma avaliação sobre a plataforma.
15. **`avaliacoes.html` (Avaliações):** Mural público com todos os depoimentos publicados sobre o site.
16. **`sobre.html` (Sobre Nós):** História do projeto e apresentação dos integrantes da equipe.
17. **`sac.html` (Ajuda / SAC):** Central de dúvidas frequentes e canais de contato.

---

## 🧩 Módulos JavaScript do Front-end (`src/`)

O JavaScript do navegador foi modularizado em **8 arquivos** carregados sob demanda em cada página:

* **`src/global.js`:** Base de todas as páginas. Define `SERVER_URL` e `API_URL` (detectando automaticamente se está em `localhost` ou em produção), mapeia as 17 páginas (`MAPA_PAGINAS`), controla a navegação (`showPage`, `voltarTelaAnterior`), sessão (`logout`, `redirecionarDashboard`), alternância de perfil (`alternarModoUsuario`), tema escuro/claro (`toggleTheme`), busca de CEP (`mascaraCep`, `buscarCepGenerico`), modal de foto (`ampliarFotoPerfil`, `fecharModalFoto`) e alertas (`mostrarToast`).
* **`src/auth-perfil.js`:** Responsável por `register` (envio do cadastro), `toggleCamposPrestador` (exibição dinâmica dos campos de prestador), `obterFormasPagamentoSelecionadas`, `login`, `carregarDadosPerfil` e `atualizarPerfil`.
* **`src/catalogo.js`:** Busca e renderiza o catálogo (`carregarCatalogoServicosCompleto`), aplica o filtro em tempo real (`filtrarCatalogoServicos`), lista profissionais (`carregarPrestadoresDisponiveis`) e carrega a página de perfil público (`verPerfilPrestador`).
* **`src/pedidos.js`:** Controla todo o fluxo de solicitações: criação (`submitRequest`), carregamento das listas do cliente e do prestador, aceite de serviço (`aceitarSolicitudeUber`), mudança de status (`atualizarStatusServico`), cancelamento com modal de re-solicitação (`recusarSolicitacaoCliente`, `responderSolicitarNovamente`) e todo o módulo de avaliações (`selecionarEstrela`, `enviarAvaliacao`, `enviarRespostaAvaliacao`, `enviarAvaliacaoSite`).
* **`src/imagens.js`:** Converte arquivos selecionados nos campos `<input type="file">` para Base64 antes do envio para a API.
* **`src/imagens-servicos.js`:** Normaliza o nome de cada serviço retornado pelo banco e associa automaticamente a imagem correspondente em `assets/servicos/`.
* **`src/Avisos.js`:** Gerencia avisos visuais e mensagens de retorno na interface.
* **`src/clique.js`:** Adiciona feedback visual interativo aos cliques na tela.

---

## 🧪 Testes Automatizados (`tests/`)

O projeto conta com **3 suítes de testes (14 testes automatizados)** cobrindo técnicas de **Caixa Branca** e **Caixa Preta**:

1. **`tests/salvarImagem.test.js` (Caixa Branca — Unitário):** Testa diretamente os desvios internos (`if/else`) de `src/utils/salvarImagem.js`: entrada nula/vazia, caminho já salvo, Base64 corrompido (retornando `null` com aviso) e salvamento real de um PNG válido em `uploads/` com limpeza automática ao final.
2. **`tests/regrasResolvJa.test.js` (Caixa Branca — Unitário):** Valida regras de negócio isoladas: atribuição da profissão padrão `"Marido de Aluguel"`, validação de CPF com 11 dígitos (com ou sem máscara), obrigatoriedade de ao menos uma forma de pagamento e criptografia/comparação de senha com `bcryptjs`.
3. **`tests/apiResolvJa.test.js` (Caixa Preta — Integração/API):** Usa **Supertest** para fazer requisições HTTP reais contra o `server.js` sem depender da implementação interna, validando:
   * `GET /ResolvJa/status-banco` → status `200` e conexão ativa com o PostgreSQL (Neon).
   * `GET /ResolvJa/servicos` → status `200` e retorno em array JSON.
   * `GET /ResolvJa/prestadores` → status `200` e retorno em array JSON.
   * `GET /ResolvJa/avaliacoes-site` → status `200` e retorno em array JSON.
   * `GET /ResolvJa/rota-inexistente` → status `404`.

---

## 🚀 Como Instalar e Executar o Projeto

### Pré-requisitos
* **Node.js** (versão 18 ou superior) instalado.
* String de conexão do banco PostgreSQL (**Neon DB**) configurada no arquivo `.env`.

### Passo a passo

1. **Acesse a pasta do projeto:**
   ```bash
   cd ProjetoPrincipal
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o arquivo `.env` na pasta `ProjetoPrincipal/`:**
   ```env
   DATABASE_URL=sua_url_de_conexao_postgresql_do_neon
   PORT=3000
   ```

4. **Inicie o servidor:**
   ```bash
   npm start
   ```
   *(Ou use `npm run dev` para reiniciar automaticamente ao editar arquivos).*

5. **Acesse no navegador:**
   Abra `http://localhost:3000` para utilizar o **ResolvJá**.

6. **Execute os testes automatizados:**
   ```bash
   npm test
   ```

---

## 👥 Equipe de Desenvolvimento

Projeto Integrador desenvolvido pelos alunos de Tecnologia da Informação (Senac):
* **Daiane**
* **Eduardo**
* **Kauã**
* **Layla**
* **Paola**
* **Talita**