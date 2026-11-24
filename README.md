# 🛠️ ResolvJá — Plataforma Web de Serviços Locais

> **Documentação Técnica Oficial & Material de Estudo Completo**\
> Da primeira versão em arquivo único à arquitetura modular *full-stack*: todo o passo a passo de construção, configurações, front-end, back-end, banco de dados e testes do **ResolvJá**.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-4169E1?logo=postgresql&logoColor=white) ![Jest](https://img.shields.io/badge/Testes-14%2F14%20Passando-22C55E?logo=jest&logoColor=white)

---

## 📑 Sumário

 1. [Sobre o Projeto](#1-sobre-o-projeto)
 2. [Equipe de Desenvolvimento](#2-equipe-de-desenvolvimento)
 3. [A História e Evolução da Arquitetura (De 1 Arquivo para Sistema Modular)](#3-a-hist%C3%B3ria-e-evolu%C3%A7%C3%A3o-da-arquitetura-de-1-arquivo-para-sistema-modular)
 4. [Tecnologias Utilizadas (Por que Escolhemos Cada Uma)](#4-tecnologias-utilizadas-por-que-escolhemos-cada-uma)
 5. [Estrutura Completa de Pastas e Arquivos](#5-estrutura-completa-de-pastas-e-arquivos)
 6. [Explicação Detalhada de Cada Configuração do Projeto](#6-explica%C3%A7%C3%A3o-detalhada-de-cada-configura%C3%A7%C3%A3o-do-projeto)
 7. [Front-end: As 17 Páginas HTML, Estilo (`style.css`) e os 8 Módulos JS (`src/`)](#7-front-end-as-17-p%C3%A1ginas-html-estilo-stylecss-e-os-8-m%C3%B3dulos-js-src)
 8. [Back-end: Arquitetura em Camadas e Mapa dos 22 Endpoints (`/ResolvJa`)](#8-back-end-arquitetura-em-camadas-e-mapa-dos-22-endpoints-resolvja)
 9. [Banco de Dados: Modelagem PostgreSQL no Neon DB](#9-banco-de-dados-modelagem-postgresql-no-neon-db)
10. [Garantia de Qualidade: Testes Automatizados e Manuais](#10-garantia-de-qualidade-testes-automatizados-e-manuais)
11. [Passo a Passo: Instalação, Execução Local e Deploy na Nuvem](#11-passo-a-passo-instala%C3%A7%C3%A3o-execu%C3%A7%C3%A3o-local-e-deploy-na-nuvem)
12. [Guia Rápido de Estudo: O Fluxo Completo em 1 Minuto](#12-guia-r%C3%A1pido-de-estudo-o-fluxo-completo-em-1-minuto)

---

## 1. Sobre o Projeto

O **ResolvJá** é uma plataforma web *full-stack* criada para conectar **clientes (solicitantes)** que precisam de serviços domésticos, reparos rápidos e assistências do dia a dia (eletricista, encanador, faxina, montagem de móveis, jardinagem, informática, cuidados, entre outros) a **profissionais autônomos locais (prestadores)** de forma prática, organizada e transparente.

### O que a plataforma faz na prática?

* **Cadastro Unificado e Alternância de Perfil:** Um mesmo usuário pode atuar como **Cliente** e como **Prestador**, alternando entre os dois painéis no menu da conta sem precisar criar cadastros separados.
* **Catálogo Dinâmico do Banco de Dados:** Os serviços são carregados direto do PostgreSQL, possuem pesquisa em tempo real, imagens locais dedicadas e um aviso transparente informando que o valor final está sujeito a alterações conforme o serviço prestado.
* **Fluxo de Pedidos Estilo Aplicativo:** O cliente solicita um serviço (com busca automática de endereço por CEP), o prestador visualiza as oportunidades, aceita o pedido e atualiza o andamento (`Pendente` → `Aceito` → `A Caminho` → `Concluído` ou `Cancelado`). Se o cliente cancelar um pedido aceito, o sistema notifica o prestador e abre um modal perguntando *"Solicitar serviço novamente?"*.
* **Sistema de Avaliações Completo:** Ao concluir o serviço, o cliente avalia com nota de 1 a 5 estrelas, comentário e foto opcional; o prestador pode responder publicamente. Há também um mural de depoimentos sobre a própria plataforma.
* **Upload Otimizado de Imagens:** Fotos são redimensionadas e comprimidas no navegador antes do envio e gravadas fisicamente na pasta `/uploads` do servidor, guardando apenas o caminho público no banco de dados.
* **Acessibilidade Visual e Mobile:** Conta com **Modo Escuro ("Blackout") / Modo Claro**, troca automática de logo e layout responsivo adaptado para computadores, tablets e celulares.

---

## 2. Equipe de Desenvolvimento

O **ResolvJá** foi desenvolvido em equipe com divisão clara de responsabilidades entre as três camadas principais de um sistema web moderno:

| Área de Atuação | Desenvolvedores | Principais Responsabilidades |
| :--- | :--- | :--- |
| **Back-end** | **Daiane** e **Talita** | Servidor Node.js/Express (`server.js`), arquitetura em camadas (`routes`, `controllers`, `repositories`, `middlewares`, `utils`), criptografia de senhas (`bcryptjs`), upload físico de imagens em `/uploads`, tratamento global de erros e testes automatizados (Jest + Supertest). |
| **Banco de Dados** | **Paola** e **Layla** | Modelagem relacional no PostgreSQL (**Neon DB**), criação e estruturação das 6 tabelas, definição das 5 chaves estrangeiras (integridade referencial), carga inicial do catálogo de serviços (`banco_resolvja.sql`) e documentação de banco (`SQL.docx`). |
| **Front-end** | **Kauã** e **Eduardo** | Construção e separação das 17 páginas HTML, folha de estilos responsiva com Modo Escuro/Claro (`style.css`), modularização dos 8 scripts JavaScript em `src/`, integração via `fetch` com a API e experiência do usuário (UI/UX). |

---

## 3. A História e Evolução da Arquitetura (De 1 Arquivo para Sistema Modular)

Entender **como o projeto evoluiu** é fundamental para quem vai estudar ou apresentar o ResolvJá.

### Fase 1 — O Protótipo Monolítico (1 HTML + 1 JS)

No início, para validar a ideia rapidamente, o site inteiro funcionava dentro de **um único arquivo `index.html`** e **um único arquivo `script.js` gigante**. Todas as telas (Home, Login, Cadastro, Catálogo, Painéis, Avaliações, Sobre e SAC) eram blocos `<section>` empilhados na mesma página, alternados com `display: none` e `display: block`.

Conforme o sistema ganhou novas funções, surgiram quatro problemas clássicos de arquitetura monolítica:

1. **Manutenção arriscada:** mexer em uma tela podia quebrar outra no mesmo arquivo.
2. **Conflitos no Git:** toda a equipe precisava editar os mesmos dois arquivos simultaneamente.
3. **Lentidão com imagens no banco:** fotos em texto Base64 pesavam nas consultas SQL.
4. **Falta de URLs reais:** o navegador não tinha rotas individuais (como `/catalogo.html`), prejudicando o botão *Voltar* e o carregamento sob demanda.

### Fase 2 — A Grande Refatoração (Passo a Passo)

A equipe realizou uma reestruturação completa sem alterar o visual aprovado:

1. **Separação em 17 páginas HTML independentes:** Cada `<section>` virou um arquivo `.html` próprio compartilhando o mesmo cabeçalho (`navbar`), tema Claro/Escuro, menu do usuário e rodapé.
2. **Mapa de navegação (`MAPA_PAGINAS`):** Em vez de quebrar os botões antigos, `src/global.js` passou a mapear cada identificador antigo para o respectivo arquivo físico (ex.: `'catalogo'` → `'catalogo.html'`) usando `window.location.href`.
3. **Memória de sessão entre páginas:** Dados do usuário logado, modo ativo (Cliente/Prestador), tema e histórico da tela anterior passaram a ser persistidos no `localStorage` e `sessionStorage`.
4. **Desmembramento do `script.js` em 8 módulos (`src/`):** Cada página passou a carregar apenas os scripts necessários. Após validar que nenhuma página nem o servidor dependiam mais do arquivo antigo, **`src/script.js` foi apagado definitivamente**.
5. **Separação do Back-end em Camadas e Upload em Disco:** O servidor passou a separar Rotas, Controllers, Repositories, Middlewares e Utilitários, salvando fotos fisicamente na pasta `uploads/`.

---

## 4. Tecnologias Utilizadas (Por que Escolhemos Cada Uma)

| Tecnologia | O que é? | Por que usamos no ResolvJá? |
| :--- | :--- | :--- |
| **HTML5** | Linguagem de marcação da web. | Estrutura semântica das 17 páginas independentes. |
| **CSS3 (Variáveis CSS)** | Estilização e layout responsivo. | Uso de `:root` e `[data-theme="dark"]` para alternar o site inteiro entre Modo Claro e Modo Escuro instantaneamente, além de Grid/Flexbox para mobile. |
| **JavaScript (ES6+)** | Programação no navegador e no servidor. | Mesma linguagem no front-end e no back-end, facilitando a integração via JSON e `fetch`. |
| **Node.js (>=18)** | Ambiente de execução JavaScript fora do navegador. | Permite rodar o servidor back-end localmente e em nuvem com alto desempenho. |
| **Express 5** | Framework web minimalista para Node.js. | Simplifica a criação da API REST (`/ResolvJa/...`), middlewares e entrega de arquivos estáticos. |
| **PostgreSQL + Neon DB** | Banco de dados relacional em nuvem. | Garante integridade dos dados com chaves estrangeiras, consultas rápidas via SQL e acesso compartilhado pela equipe na nuvem com SSL. |
| **`pg` (node-postgres)** | Driver oficial do PostgreSQL para Node.js. | Gerencia o `Pool` de conexões e consultas parametrizadas (`$1, $2...`) que previnem **SQL Injection**. |
| **`bcryptjs`** | Biblioteca de criptografia (hashing). | Transforma senhas em hashes irreversíveis antes de salvar no banco — nenhuma senha fica em texto puro. |
| **`cors`** | Middleware de controle de origem (CORS). | Permite que o front-end faça requisições HTTP à API sem bloqueios de segurança do navegador. |
| **`dotenv`** | Carregador de variáveis de ambiente. | Lê credenciais sensíveis do arquivo `.env` sem expor senhas no código-fonte do GitHub. |
| **Jest + Supertest** | Frameworks de testes automatizados. | O **Jest** testa funções isoladas (Caixa Branca) e o **Supertest** testa as rotas reais da API (Caixa Preta). |

---

## 5. Estrutura Completa de Pastas e Arquivos

```text
ProjetoPrincipal/
├── assets/                     # Mídias estáticas do site
│   ├── equipe/                 # Fotos dos 6 integrantes (daiane, eduardo, kauan, layla, paola, talita)
│   ├── servicos/               # Fotografias locais para cada categoria do catálogo de serviços
│   ├── favicon.png             # Ícone da aba do navegador
│   ├── logo-claro.png          # Logotipo exibido no Modo Claro
│   ├── logo-escuro.png         # Logotipo exibido no Modo Escuro
│   └── trabalhadores.mp4       # Vídeo de fundo da tela inicial (Hero)
├── uploads/                    # Fotos enviadas pelos usuários (perfil e avaliações) salvas pelo servidor
├── src/
│   ├── controllers/            # Camada HTTP: valida requisições, aplica regras e envia respostas JSON
│   │   ├── avaliacaoSiteController.js
│   │   ├── prestadorController.js
│   │   ├── solicitacaoController.js
│   │   ├── solicitanteController.js
│   │   └── tipoServicoController.js
│   ├── repositories/           # Camada de Dados: executa exclusivamente SQL parametrizado no Neon DB
│   │   ├── avaliacaoSiteRepository.js
│   │   ├── prestadorRepository.js
│   │   ├── solicitacaoRepository.js
│   │   ├── solicitanteRepository.js
│   │   └── tipoServicoRepository.js
│   ├── routes/                 # Camada de Roteamento: mapeia URLs sob /ResolvJa para os controllers
│   │   ├── index.js            # Agrupador central de todas as rotas da API
│   │   ├── avaliacaoSiteRoutes.js
│   │   ├── prestadorRoutes.js
│   │   ├── solicitacaoRoutes.js
│   │   ├── solicitanteRoutes.js
│   │   └── tipoServicoRoutes.js
│   ├── middlewares/
│   │   └── errorHandler.js     # Intercepta erros inesperados e traduz códigos do PostgreSQL
│   ├── utils/
│   │   └── salvarImagem.js     # Converte Base64 em arquivo físico na pasta /uploads
│   ├── global.js               # Base do front-end: API_URL, navegação, auth, tema, CEP, modal e toast
│   ├── auth-perfil.js          # Lógica de cadastro, login e edição de perfil
│   ├── catalogo.js             # Catálogo dinâmico, pesquisa e vitrine/perfil de prestadores
│   ├── pedidos.js              # Ciclo de vida dos pedidos, agenda do prestador e avaliações
│   ├── imagens.js              # Redimensionamento (512px) e compressão de fotos no navegador
│   ├── imagens-servicos.js     # Mapeamento inteligente das fotos locais de assets/servicos/
│   ├── Avisos.js               # Customização de alertas toast e avisos clicáveis de login
│   └── clique.js               # Efeito visual de clique (anel laranja) e cursor personalizado
├── tests/                      # Suítes de testes automatizados (Jest + Supertest)
│   ├── salvarImagem.test.js    # Caixa Branca — testa src/utils/salvarImagem.js
│   ├── regrasResolvJa.test.js  # Caixa Branca — regras de negócio e criptografia bcryptjs
│   └── apiResolvJa.test.js     # Caixa Preta — testa endpoints reais da API e conexão com o banco
├── *.html                      # 17 páginas HTML independentes do site
├── style.css                   # Folha de estilos global (variáveis de tema Claro/Escuro + responsivo)
├── banco.js                    # Pool de conexão SSL com o PostgreSQL (Neon DB)
├── server.js                   # Ponto de entrada do servidor Express
├── package.json                # Dependências, metadados e scripts (start, dev, test)
├── .gitignore                  # Lista de arquivos/pastas que o Git NÃO deve enviar ao GitHub
└── .env                        # Variáveis de ambiente locais (DATABASE_URL, PORT) — privado
```

---

## 6. Explicação Detalhada de Cada Configuração do Projeto

Esta seção explica **cada arquivo de configuração** para que qualquer integrante saiba exatamente o que ele faz e por que está configurado assim.

### 6.1 `package.json` — Coração do Projeto Node.js

Define o nome do pacote, as bibliotecas instaladas e os comandos rápidos do terminal:

* **`dependencies` (produção):** `express` (servidor), `pg` (PostgreSQL), `bcryptjs` (senhas), `cors` (acesso entre origens) e `dotenv` (variáveis do `.env`).
* **`devDependencies` (desenvolvimento/testes):** `jest` e `supertest` — só são necessários para rodar os testes e não pesam na execução normal do site.
* **`scripts`:**
  * `"start": "node server.js"` → permite digitar apenas `npm start` no terminal para ligar o servidor. *(Nunca se deve colocar `"npm start"` dentro de `"start"`, pois isso gera loop infinito.)*
  * `"dev": "node --watch server.js"` → permite digitar `npm run dev` para que o servidor reinicie automaticamente toda vez que um arquivo for salvo.
  * `"test": "jest"` (ou `"jest --forceExit"`) → permite digitar `npm test` para rodar automaticamente todos os arquivos `*.test.js` da pasta `tests/`.

### 6.2 `.env` — Variáveis de Ambiente (Segurança)

Fica dentro de `ProjetoPrincipal/.env` e guarda informações sensíveis que mudam de um computador/servidor para outro:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST_DO_NEON/NOME_DO_BANCO?sslmode=require"
PORT=3000
```

* **`DATABASE_URL`:** endereço completo de conexão com o banco no **Neon DB** (contém usuário, senha, host e obrigatoriedade de criptografia `sslmode=require`).
* **`PORT`:** porta local padrão (`3000`). Em serviços de nuvem (como Render ou Railway), a plataforma injeta a própria porta em `process.env.PORT`.

### 6.3 `.gitignore` — Proteção do Repositório Git

Impede que arquivos secretos ou pesados subam para o GitHub:

* **`.env`:** protege a senha do banco de dados de ficar pública na internet.
* **`node_modules/`:** pasta pesada com milhares de arquivos das bibliotecas; qualquer pessoa a recria automaticamente rodando `npm install`.

### 6.4 `banco.js` — Configuração da Conexão PostgreSQL (Neon DB)

* Carrega o `dotenv` logo na primeira linha para ler `process.env.DATABASE_URL`.
* Remove eventuais aspas extras da string de conexão para evitar falhas de leitura.
* Cria um **`Pool`** do `pg` (reaproveita conexões abertas em vez de abrir e fechar uma conexão a cada clique, deixando o site rápido).
* Ativa **`ssl: { rejectUnauthorized: false }`**, exigido pelo Neon DB para tráfego criptografado na nuvem.
* Exporta o `pool` para todos os `repositories` e para o encerramento limpo (`afterAll`) dos testes.

### 6.5 `server.js` — Configuração do Servidor Express

Configura todas as engrenagens do back-end em ordem exata:

1. **`app.use(cors())`:** libera requisições vindas do front-end.
2. **`app.use(express.json({ limit: '50mb' }))` e `urlencoded`:** aumenta o limite de tamanho do corpo das requisições (o padrão do Express é pequeno demais para receber fotos em Base64 antes de salvá-las em disco).
3. **`app.use(express.static(__dirname))`:** faz o próprio Express servir as 17 páginas HTML, o `style.css`, a pasta `assets/` e os scripts de `src/` no mesmo endereço (`http://localhost:3000`).
4. **`app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`:** expõe publicamente as fotos salvas em disco para que `<img src="/uploads/foto.png">` funcione no navegador.
5. **Rota `/ResolvJa/status-banco`:** executa `SELECT NOW()` no PostgreSQL para diagnosticar se o banco está online.
6. **`app.use('/ResolvJa', routes)`:** acopla todas as rotas da API sob o prefixo único `/ResolvJa`.
7. **`app.use(errorHandler)`:** middleware final que captura qualquer erro das rotas sem derrubar o servidor.
8. **Exportação condicional para testes:**

```javascript
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
  });
}

module.exports = app;
```

*Por que esse `if (require.main === module)` existe?* Quando rodamos `npm start`, o `server.js` é o arquivo principal e abre a porta 3000. Quando rodamos `npm test`, o Supertest importa o `app` sem precisar abrir a porta 3000 — evitando o erro `EADDRINUSE` (porta já em uso).

### 6.6 Detecção Automática de Ambiente no Front-end (`src/global.js`)

O front-end verifica automaticamente `window.location.hostname`:

* Se estiver rodando localmente (`localhost`, `127.0.0.1` ou `file:`), define `SERVER_URL = 'http://localhost:3000'`.
* Se estiver publicado na nuvem (Render, Railway etc.), usa automaticamente `window.location.origin`.
* Assim, `API_URL` fica sempre apontando para `${SERVER_URL}/ResolvJa` sem precisar alterar código na hora do deploy.

---

## 7. Front-end: As 17 Páginas HTML, Estilo (`style.css`) e os 8 Módulos JS (`src/`)

*(Desenvolvido por **Kauã** e **Eduardo**)*

### 7.1 As 17 Páginas HTML (Jornada Completa do Usuário)

#### Porta de Entrada e Institucional

| Página | Função no Sistema | Scripts Carregados |
| :--- | :--- | :--- |
| **`index.html`** | Página inicial com vídeo de fundo (`trabalhadores.mp4`), botões rápidos, cards informativos (Cliente, Prestador, Avaliações), Missão/Visão/Valores e banner do SAC. | `global`, `Avisos`, `clique` |
| **`sobre.html`** | História do projeto, propósito do ResolvJá e apresentação visual dos 6 integrantes da equipe (`assets/equipe/`). | `global`, `Avisos`, `clique` |
| **`sac.html`** | Central de ajuda com perguntas frequentes (FAQ expansível com `<details>`) e canais de suporte. | `global`, `Avisos`, `clique` |
| **`avaliacoes.html`** | Mural público que consulta a API e exibe os depoimentos e notas com estrelas sobre a plataforma. | `global`, `Avisos`, `pedidos`, `clique` |

#### Acesso, Cadastro e Gestão de Conta

| Página | Função no Sistema | Scripts Carregados |
| :--- | :--- | :--- |
| **`cadastro.html`** | Formulário unificado com busca automática de CEP. Ao escolher *Prestador*, abre dinamicamente profissão, experiência, valores mínimo/máximo, disponibilidade, foto obrigatória e checkboxes de formas de pagamento. | `global`, `Avisos`, `imagens`, `auth-perfil`, `clique` |
| **`login.html`** | Autenticação de clientes e prestadores por e-mail/usuário e senha. | `global`, `Avisos`, `auth-perfil`, `clique` |
| **`meu-perfil.html`** | Edição de dados de contato, endereço, dados profissionais e foto com prévia redonda e ícone de lápis. Por segurança, `CPF`, `RG` e `Data de Nascimento` ficam bloqueados (`disabled`). | `global`, `Avisos`, `imagens`, `auth-perfil`, `clique` |
| **`atualizar-senha.html`** | Tela dedicada preparada para a funcionalidade futura de alteração de senha. | `global`, `Avisos`, `clique` |

#### Exploração de Serviços e Profissionais

| Página | Função no Sistema | Scripts Carregados |
| :--- | :--- | :--- |
| **`catalogo.html`** | Carrega os serviços ativos do PostgreSQL, aplica fotos locais, filtra em tempo real pela barra de pesquisa e exibe o aviso de que o valor final pode variar conforme o serviço. | `global`, `Avisos`, `imagens-servicos`, `catalogo`, `clique` |
| **`profissionais.html`** | Vitrine pública de prestadores cadastrados com foto circular, profissão, faixa de valores e botão para abrir o perfil. | `global`, `Avisos`, `catalogo`, `clique` |
| **`perfil-prestador.html`** | Página pública de um profissional específico com foto ampliável, descrição, disponibilidade, formas de pagamento aceitas e histórico de avaliações recebidas. | `global`, `Avisos`, `catalogo`, `clique` |
| **`solicitar.html`** | Formulário de abertura de pedido. Se o usuário veio do catálogo, o serviço já chega pré-selecionado. Inclui data, horário, busca de CEP e descrição. | `global`, `Avisos`, `pedidos`, `clique` |

#### Painéis Logados e Pós-Serviço

| Página | Função no Sistema | Scripts Carregados |
| :--- | :--- | :--- |
| **`painel-cliente.html`** | Dashboard inicial do solicitante com saudação personalizada e menu lateral de atalhos. | `global`, `Avisos`, `clique` |
| **`meus-pedidos.html`** | Lista todas as solicitações do cliente com status em tempo real, dados do profissional, botão para avaliar serviços concluídos e modal *"Solicitar serviço novamente?"* ao cancelar. | `global`, `Avisos`, `pedidos`, `clique` |
| **`painel-prestador.html`** | Central do profissional com 3 visões: *Oportunidades* (pedidos abertos), *Minha Agenda* (marcar `A Caminho` ou `Concluído`) e *Concluídos* (ler e responder avaliações). | `global`, `Avisos`, `pedidos`, `clique` |
| **`avaliar-servico.html`** | Avaliação pós-atendimento com 5 estrelas clicáveis, campo de comentário e upload opcional de foto do resultado. | `global`, `Avisos`, `imagens`, `pedidos`, `clique` |
| **`avaliar-site.html`** | Formulário para avaliar a experiência geral na plataforma ResolvJá. | `global`, `Avisos`, `pedidos`, `clique` |

### 7.2 Folha de Estilos (`style.css`)

Organizada em 17 blocos numerados e comentados:

* **Tema Claro & Modo Escuro ("Blackout"):** utiliza variáveis CSS (`--primary`, `--accent`, `--background`, `--surface`, `--text-main`, `--border`) sob `:root` e `[data-theme="dark"]`, adaptando inclusive cards gerados dinamicamente pelo JavaScript e alternando `.logo-claro` e `.logo-escuro`.
* **Layout e Componentes:** navbar em 3 colunas (logo à esquerda, links ao centro, ações à direita), cards com altura igualada (`align-items: stretch`) e efeito hover, modal de ampliação de foto estilo 10x15, checkboxes estilizados de pagamento, modal de confirmação de re-solicitação e grade responsiva da equipe.
* **Responsividade Mobile (`@media`):** adapta navbar, dashboard, formulários, botões do Hero, modal de foto e grade da equipe para tablets (`<=1000px`/`900px`) e celulares (`<=768px`/`550px`).

### 7.3 Os 8 Módulos JavaScript (`src/`)

1. **`src/global.js` (Base — carregado primeiro em todas as páginas):**
   * `SERVER_URL`, `API_URL` e `resolverUrlFoto(caminho)` — configuração automática de ambiente e normalização de URLs de imagem.
   * `MAPA_PAGINAS`, `showPage()` e `voltarTelaAnterior()` — navegação entre as 17 páginas HTML.
   * `atualizarInterfaceAuth()`, `toggleUserMenu()`, `carregarFotoNavbarImediata()`, `carregarSaudacaoDashboard()` — estado da barra superior e saudação nos painéis.
   * `tratarCliqueAuthNav()`, `redirecionarDashboard()`, `alternarModoUsuario()`, `logout()` — controle de login, saída e alternância Cliente ↔ Prestador.
   * `toggleTheme()` — troca Modo Claro/Escuro salvando preferência no navegador.
   * `mascaraCep()` e `buscarCepGenerico()` — formatação de CEP e consulta à API pública **ViaCEP**.
   * `ampliarFotoPerfil()`, `fecharModalFoto()` e `mostrarToast()` — modal de avatar ampliado e avisos flutuantes.
2. **`src/auth-perfil.js` (Autenticação e Perfil):**
   * `toggleCamposPrestador()` — exibe/oculta campos extras no cadastro conforme o tipo de conta.
   * `obterFormasPagamentoSelecionadas()` e `marcarFormasPagamento()` — leitura e preenchimento dos checkboxes de pagamento.
   * `buscarCepCadastro()`, `register()`, `login()`, `carregarDadosPerfil()` e `atualizarPerfil()` — envio de `POST`/`PUT` à API e gestão dos dados da conta.
3. **`src/catalogo.js` (Catálogo e Profissionais):**
   * `carregarCatalogoServicosCompleto()` e `filtrarCatalogoServicos()` — carrega serviços do banco e aplica busca instantânea.
   * `solicitarServicoCatalogo()` — leva o serviço escolhido pré-selecionado para `solicitar.html`.
   * `carregarPrestadoresDisponiveis()` e `verPerfilPrestador()` — renderiza a vitrine e o perfil público com avaliações.
4. **`src/pedidos.js` (Pedidos, Agenda e Avaliações):**
   * `inicializarPaginaSolicitar()`, `verificarOutroServico()`, `buscarEnderecoPorCep()`, `submitRequest()` — abertura de novos pedidos.
   * `carregarMinhasSolicitacoes()`, `confirmarSolicitacaoCliente()`, `recusarSolicitacaoCliente()`, `abrirModalSolicitarNovamente()`, `responderSolicitarNovamente()` — gestão do cliente e cancelamento estilo aplicativo.
   * `carregarOportunidadesPrestador()`, `aceitarSolicitudeUber()`, `carregarAgendaPrestador()`, `atualizarStatusServico()`, `carregarConcluidosPrestador()` — fluxo completo do prestador.
   * `abrirTelaAvaliacao()`, `selecionarEstrela()`, `enviarAvaliacao()`, `enviarRespostaAvaliacao()`, `enviarAvaliacaoSite()`, `abrirTelaAvaliacoesSite()` — estrelas, comentários, fotos e respostas.
5. **`src/imagens.js` (Otimização de Upload):**
   * Redimensiona fotos selecionadas pelo usuário para no máximo `512px` com qualidade `0.85` em um `<canvas>` antes de converter para Base64, reduzindo drasticamente o tamanho do envio.
6. **`src/imagens-servicos.js` (Mapeamento de Fotos do Catálogo):**
   * `normalizarTextoServico()`, `localizarRegistroServico()` e `encontrarRegraInteligente()` associam o nome de cada serviço do banco à fotografia local correta em `assets/servicos/` (com fallback seguro).
7. **`src/Avisos.js` (Notificações):**
   * Aprimora o comportamento dos toasts centrais, destacando erros e tornando mensagens de login clicáveis.
8. **`src/clique.js` (Interatividade Visual):**
   * Aplica o efeito de anel laranja ao clicar na tela e o cursor personalizado em elementos interativos.

---

## 8. Back-end: Arquitetura em Camadas e Mapa dos 22 Endpoints (`/ResolvJa`)

*(Desenvolvido por **Daiane** e **Talita**)*

### Como uma requisição viaja por dentro do servidor

```text
Navegador (fetch) ──► server.js ──► src/routes/ ──► src/controllers/ ──► src/repositories/ ──► PostgreSQL (Neon DB)
                                                            │
                                                            ├──► bcryptjs (hash de senha)
                                                            ├──► src/utils/salvarImagem.js (grava em /uploads)
                                                            └──► src/middlewares/errorHandler.js (se ocorrer erro)
```

* **`src/routes/`:** recebe a URL e o método HTTP (`GET`, `POST`, `PUT`) e encaminha ao controller certo.
* **`src/controllers/`:** valida campos obrigatórios, criptografa senhas com `bcryptjs`, aciona `salvarImagemEmPasta()` e devolve o status HTTP correto (`200`, `201`, `400`, `404`, `409`, `500`).
* **`src/repositories/`:** executa exclusivamente queries SQL parametrizadas (`$1, $2...`) via `pool.query`, protegendo contra SQL Injection.
* **`src/utils/salvarImagem.js`:** recebe a string Base64, valida o cabeçalho `data:image/...`, cria a pasta `uploads/` se não existir, converte em arquivo binário com nome único (`prefixo_timestamp_aleatorio.ext`) e retorna apenas o caminho público (`/uploads/...`).
* **`src/middlewares/errorHandler.js`:** intercepta exceções globais e traduz códigos técnicos do PostgreSQL em mensagens claras (`23505` = CPF/e-mail já cadastrado → `409`; `23503` = chave estrangeira inválida → `400`).

### Mapa Completo dos 22 Endpoints da API

| Método | Endpoint | Controller / Função | O que faz |
| :--- | :--- | :--- | :--- |
| `GET` | `/ResolvJa/status-banco` | `server.js` | Verifica se o PostgreSQL (Neon DB) está conectado e retorna a hora do banco. |
| `POST` | `/ResolvJa/solicitantes` | `solicitanteController.cadastrar` | Cadastra novo cliente, salva foto em `/uploads` e criptografa senha. |
| `GET` | `/ResolvJa/solicitantes` | `solicitanteController.listar` | Lista todos os clientes cadastrados. |
| `GET` | `/ResolvJa/solicitantes/:id` | `solicitanteController.buscarPorId` | Retorna os dados de um cliente específico pelo ID. |
| `PUT` | `/ResolvJa/solicitantes/:id` | `solicitanteController.atualizar` | Atualiza dados cadastrais e foto de perfil do cliente. |
| `GET` | `/ResolvJa/solicitantes/:id/solicitacoes` | `solicitacaoController.listarPorSolicitante` | Lista todos os pedidos feitos por um cliente específico. |
| `POST` | `/ResolvJa/prestadores` | `prestadorController.cadastrar` | Cadastra prestador com profissão, faixa de preço, pagamentos e foto. |
| `GET` | `/ResolvJa/prestadores` | `prestadorController.listar` | Lista todos os profissionais para a vitrine. |
| `GET` | `/ResolvJa/prestadores/:id` | `prestadorController.buscarPorId` | Retorna o perfil completo de um prestador pelo código. |
| `PUT` | `/ResolvJa/prestadores/:id` | `prestadorController.atualizar` | Atualiza dados, profissão, formas de pagamento e foto do prestador. |
| `POST` | `/ResolvJa/prestadores/:id/servicos` | `prestadorController.vincularServico` | Vincula uma categoria do catálogo a um prestador (`prestador_servico`). |
| `GET` | `/ResolvJa/prestadores/:id/servicos` | `prestadorController.listarServicos` | Lista os serviços ativos vinculados a um prestador. |
| `GET` | `/ResolvJa/servicos` | `tipoServicoController.listar` | Retorna todos os serviços ativos do catálogo. |
| `POST` | `/ResolvJa/servicos` | `tipoServicoController.cadastrar` | Cadastra uma nova categoria de serviço no catálogo. |
| `GET` | `/ResolvJa/servicos/:id/prestadores` | `tipoServicoController.listarPrestadores` | Lista os prestadores que atendem um serviço específico. |
| `POST` | `/ResolvJa/solicitacoes` | `solicitacaoController.criar` | Abre um novo pedido de serviço (status inicial `Pendente`). |
| `GET` | `/ResolvJa/solicitacoes` | `solicitacaoController.listar` | Lista solicitações com `JOIN` de cliente, tipo de serviço e prestador. |
| `PUT` | `/ResolvJa/solicitacoes/:id/status` | `solicitacaoController.atualizarStatus` | Atualiza status (`Aceito`, `A Caminho`, `Concluído`, `Cancelado`) e vincula prestador. |
| `PUT` | `/ResolvJa/solicitacoes/:id/avaliar` | `solicitacaoController.avaliar` | Registra nota (1–5), comentário e foto opcional do serviço concluído. |
| `PUT` | `/ResolvJa/solicitacoes/:id/responder-avaliacao` | `solicitacaoController.responderAvaliacao` | Salva a resposta pública do prestador a uma avaliação recebida. |
| `POST` | `/ResolvJa/avaliacoes-site` | `avaliacaoSiteController.criar` | Publica um novo depoimento sobre a plataforma ResolvJá. |
| `GET` | `/ResolvJa/avaliacoes-site` | `avaliacaoSiteController.listar` | Lista os depoimentos do site do mais recente para o mais antigo. |

---

## 9. Banco de Dados: Modelagem PostgreSQL no Neon DB

*(Desenvolvido por **Paola** e **Layla**)*

O banco de dados relacional do ResolvJá está hospedado em nuvem no **Neon DB (PostgreSQL)** e é formado por **6 tabelas** no schema `public`, conectadas por **5 chaves estrangeiras (Foreign Keys)** que garantem integridade referencial.

### Visão Geral das 6 Tabelas

1. **`solicitante`:** clientes cadastrados (`id_solicitante`, nome, CPF e e-mail únicos, RG, nascimento, telefone, senha criptografada, endereço, estado civil, `foto_perfil`, `criado_em`).
2. **`prestador`:** profissionais cadastrados (`cod_prestador`, dados pessoais, `profissao_funcao`, experiência, descrição, `possui_equipamentos`, `valor_minimo`, `valor_maximo`, disponibilidade, `formas_pagamento`, senha, `foto_perfil`).
3. **`tipo_servico`:** catálogo de serviços (`id_tipo_servico`, nome, descrição, `ativo`, `preco_a_partir`, categoria, `imagem_url`, foto).
4. **`prestador_servico`:** tabela associativa **N:N** ligando prestadores às categorias de serviço que cada um atende (`cod_prestador` + `id_tipo_servico`).
5. **`solicitacao`:** núcleo operacional de pedidos e avaliações (`id_solicitacao`, cliente, serviço, prestador, data, horário, endereço, descrição, valor combinado, forma de pagamento, `status`, `nota_avaliacao`, `comentario_avaliacao`, `foto_avaliacao`, `resposta_avaliacao`, `motivo_cancelamento`).
6. **`avaliacao_site`:** depoimentos públicos sobre a plataforma (`id_avaliacao`, `id_usuario`, `nome_usuario`, `nota`, `comentario`, `criado_em`).

### Os 5 Relacionamentos (Chaves Estrangeiras)

| \# | Origem | Destino | Regra de Integridade |
| :--- | :--- | :--- | :--- |
| 1 | `solicitacao.id_solicitante` | `solicitante.id_solicitante` | Todo pedido pertence a um cliente válido (`ON DELETE CASCADE`). |
| 2 | `solicitacao.id_tipo_servico` | `tipo_servico.id_tipo_servico` | Impede apagar um serviço que já possui pedidos (`ON DELETE RESTRICT`). |
| 3 | `solicitacao.cod_prestador` | `prestador.cod_prestador` | Vincula o profissional que aceitou, preservando histórico se sair (`ON DELETE SET NULL`). |
| 4 | `prestador_servico.cod_prestador` | `prestador.cod_prestador` | Associa o prestador aos seus serviços (`ON DELETE CASCADE`). |
| 5 | `prestador_servico.id_tipo_servico` | `tipo_servico.id_tipo_servico` | Associa a categoria aos prestadores habilitados (`ON DELETE CASCADE`). |

> 📄 **Para montar um banco igual do zero:** consulte o guia separado **`SQL.docx`** e execute o script completo **`banco_resolvja.sql`** (que cria todas as tabelas, chaves estrangeiras e já popula 27 serviços iniciais no catálogo).

---

## 10. Garantia de Qualidade: Testes Automatizados e Manuais

Para validar tanto o código interno quanto a experiência real do usuário, aplicamos as **4 técnicas de modelagem de testes**:

* **Caixa Branca vs. Caixa Preta:** define se olhamos o código interno (`if/else`, funções) ou apenas entradas e saídas como usuário/cliente HTTP.
* **Manual vs. Automatizado:** define se os testes são executados por pessoas no navegador ou por scripts no terminal.

### 10.1 Testes Automatizados (`npm test` — 3 Suítes, 14/14 Passando)

| Arquivo em `tests/` | Técnica | Quantidade | O que é validado |
| :--- | :--- | :---: | :--- |
| **`salvarImagem.test.js`** | Caixa Branca (Automatizado) | 4 testes | Testa os desvios reais de `src/utils/salvarImagem.js`: entrada nula/vazia retorna `null`; caminho já salvo permanece intacto; Base64 corrompido dispara aviso e retorna `null` sem quebrar; PNG válido grava arquivo real em `uploads/` e apaga ao final. |
| **`regrasResolvJa.test.js`** | Caixa Branca (Automatizado) | 5 testes | Valida profissão padrão `'Marido de Aluguel'`, manutenção da profissão informada, CPF com 11 dígitos (com ou sem máscara), obrigatoriedade de formas de pagamento e hash/comparação de senha com `bcryptjs`. |
| **`apiResolvJa.test.js`** | Caixa Preta (Automatizado) | 5 testes | Usa **Supertest** contra o `server.js`: `GET /ResolvJa/status-banco` (`200` + `conectado: true`), `/servicos`, `/prestadores`, `/avaliacoes-site` (`200` + array JSON) e rota inexistente (`404`), encerrando o banco com `afterAll(() => pool.end())`. |

### 10.2 Testes Manuais (Navegador e Mobile)

* **Caminho Feliz:** cadastrar prestador com busca de CEP, foto e formas de pagamento → fazer login → alternar perfil → filtrar serviço no catálogo → abrir, aceitar e concluir pedido → avaliar com estrelas.
* **Caminho Triste (Validações):** tentar enviar formulários vazios ou senhas diferentes; confirmar bloqueio de `CPF`, `RG` e `Data de Nascimento` em `meu-perfil.html`; cancelar pedido aceito e validar o modal *"Solicitar serviço novamente?"*.
* **Interface e Mobile:** testar Modo Claro/Escuro em múltiplas páginas, ampliar foto no menu do usuário e inspecionar em largura mobile (`375px` no DevTools `F12`) sem quebra de layout.
* **Exploratório:** navegar por todos os links da navbar e rodapé (zero erros `404`), botão Voltar e `F5` mantendo a sessão ativa.

---

## 11. Passo a Passo: Instalação, Execução Local e Deploy na Nuvem

### 11.1 Rodando na Sua Máquina (Local)

1. **Pré-requisitos:** instale o **Node.js (versão 18 ou superior)**.
2. **Crie o banco de dados:** crie um projeto gratuito no [Neon DB](https://neon.tech) (ou PostgreSQL local), execute o arquivo `banco_resolvja.sql` e copie a `DATABASE_URL`.
3. **Crie o arquivo `.env`** dentro de `ProjetoPrincipal/`:

   ```env
   DATABASE_URL="postgresql://USUARIO:SENHA@HOST_DO_NEON/NOME_DO_BANCO?sslmode=require"
   PORT=3000
   ```
4. **Instale as dependências:** no terminal, dentro da pasta `ProjetoPrincipal/`, rode:

   ```bash
   npm install
   ```
5. **Inicie o sistema:**

   ```bash
   npm start        # Inicia o servidor em http://localhost:3000
   npm run dev      # Inicia com reinício automático ao salvar arquivos
   npm test         # Executa as 3 suítes de testes automatizados (14 testes)
   ```
6. **Teste rápido do banco:** acesse `http://localhost:3000/ResolvJa/status-banco` e confirme o retorno `{"conectado": true}`.

### 11.2 Publicando na Nuvem (Render ou Railway)

> **Nota importante:** hospedagens apenas de PHP/estático (como InfinityFree) **não executam Node.js**. Para publicar o sistema completo (front-end + back-end juntos), utilize **Render** ou **Railway**:

1. Suba o repositório para o GitHub (certificando-se de que `.env` e `node_modules/` estão no `.gitignore`).
2. Crie um **Web Service** no Render (ou novo projeto no Railway) conectado ao repositório:
   * **Root Directory:** `ProjetoPrincipal`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Environment Variable:** adicione `DATABASE_URL` com a string do Neon DB.
3. Assim que publicar, o `src/global.js` detecta automaticamente a URL de produção sem nenhuma alteração de código.

---

## 12. Guia Rápido de Estudo: O Fluxo Completo em 1 Minuto

Para explicar o funcionamento do **ResolvJá** de ponta a ponta em qualquer apresentação:

1. **Front-end (Kauã e Eduardo):** O usuário acessa uma das 17 páginas HTML estilizadas com `style.css` (Modo Claro/Escuro e mobile). Os 8 módulos em `src/` cuidam da busca de CEP, compressão da foto (`imagens.js`) e envio de requisições JSON via `fetch` para `/ResolvJa`.
2. **Back-end (Daiane e Talita):** O `server.js` (Node.js + Express) encaminha a requisição pelas camadas `routes` → `controllers` → `repositories`. Senhas recebem hash via `bcryptjs`, fotos são salvas fisicamente em `/uploads` (`salvarImagem.js`) e erros são tratados pelo `errorHandler.js`.
3. **Banco de Dados (Paola e Layla):** Os `repositories` executam SQL parametrizado via `banco.js` no PostgreSQL hospedado no **Neon DB**, persistindo tudo em 6 tabelas protegidas por 5 chaves estrangeiras.
4. **Qualidade:** Ao rodar `npm test`, o **Jest** e o **Supertest** validam 14 cenários (Caixa Branca e Caixa Preta) em menos de 5 segundos, complementados pelos testes manuais de interface no navegador e celular.