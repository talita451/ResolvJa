
# ResolvJá + Neon DB

Trabalho de back-end simples pro projeto ResolvJá, rodando com Node e banco Neon (PostgreSQL).
Desenvolvedores: Talita, Daiane, Paola, Layla, Kauã, Eduardo.

---

## O que foi usado

- Node.js
- Express
- PostgreSQL
- Neon DB
- JavaScript

---

## Como rodar o projeto

### 1. Criar o banco no Neon
1. Entra lá no painel do Neon DB.
2. Abre o SQL Editor.
3. Roda o arquivo sql/resolvja-neon.sql pra criar as tabelas do banco (solicitante, prestador, servico).

### 2. Configurar o projeto
Abre a pasta backend no terminal e instala os pacotes:

npm install

Depois cria o arquivo .env 

DATABASE_URL=postgresql://USUARIO:SENHA@HOST/NEON_DB?sslmode=require
PORT=3000

Obs: Não manda o arquivo .env pro GitHub nem compartilha com ninguém por causa da senha.

### 3. Rodar a aplicação

npm start

A API vai rodar no endereço: http://localhost:3000

---

## Testando se tá rodando

- Teste da API: GET http://localhost:3000/
- Teste da conexão com o banco: GET http://localhost:3000/api/teste-banco

---

## Rotas da API e exemplos de teste (Postman)

Sempre colocar no Header das requisições POST e PUT: Content-Type: application/json.

---

### Solicitantes (/api/solicitantes)

#### 1. Cadastrar Solicitante
- Método: POST
- URL: http://localhost:3000/api/solicitantes
- Body (JSON):
{
  "nome": "Mariana Oliveira",
  "cpf": "234.567.890-11",
  "rg": "23.456.789-0",
  "email": "mariana.oliveira@email.com",
  "data_nascimento": "1995-08-22",
  "telefone": "(11) 97777-6666",
  "senha": "senhaSegura456",
  "endereco": "Rua das Flores, 45 - São Paulo/SP",
  "estado_civil": "Solteira"
}

- Retorno da API (201 Created):
{
  "mensagem": "Solicitante cadastrado com sucesso",
  "solicitante": {
    "id_solicitante": 1,
    "nome": "Mariana Oliveira",
    "email": "mariana.oliveira@email.com"
  }
}

#### 2. Listar Solicitantes
- Método: GET
- URL: http://localhost:3000/api/solicitantes
- Body: none

---

### Prestadores (/api/prestadores)

#### 1. Cadastrar Prestador
- Método: POST
- URL: http://localhost:3000/api/prestadores
- Body (JSON):
{
  "nome": "Fernando Souza",
  "email": "fernando.souza@email.com",
  "cpf": "345.678.901-22",
  "rg": "34.567.890-1",
  "cnh": "98765432100",
  "sexo": "Masculino",
  "data_nascimento": "1992-03-14",
  "telefone": "(11) 96666-5555",
  "escolaridade": "Ensino Técnico Completo",
  "endereco_completo": "Rua das Palmeiras, 120 - São Paulo/SP",
  "profissao_funcao": "Encanador",
  "experiencia": "intermediário",
  "descricao_funcoes": "Desentupimento, reparos em vazamentos, instalação de torneiras e tubulações.",
  "possui_equipamentos": true,
  "valor_minimo": 80.00,
  "valor_maximo": 250.00,
  "antecedentes_criminais": "Nada consta",
  "disponibilidade_horario": "Segunda a Sábado, das 07:00 às 19:00"
}
(No campo experiencia só aceita: 'básico', 'intermediário' ou 'avançado')

- Retorno da API (201 Created):
{
  "mensagem": "Prestador cadastrado com sucesso!",
  "prestador": {
    "cod_prestador": 1,
    "nome": "Fernando Souza",
    "email": "fernando.souza@email.com",
    "profissao_funcao": "Encanador",
    "criado_em": "2026-09-24T03:22:47.873Z"
  }
}

#### 2. Listar Prestadores
- Método: GET
- URL: http://localhost:3000/api/prestadores
- Body: none

---

### Serviços (/api/servicos)

#### 1. Criar novo serviço
- Método: POST
- URL: http://localhost:3000/api/servicos
- Body (JSON):
{
  "id_solicitante": 1,
  "titulo": "Reparo de vazamento no banheiro",
  "descricao": "Troca do reparo da descarga e conserto de sifão com vazamento sob a pia."
}

- Retorno da API (201 Created):
{
  "mensagem": "Serviço criado com sucesso",
  "servico": {
    "id_servico": 1,
    "id_solicitante": 1,
    "cod_prestador": null,
    "titulo": "Reparo de vazamento no banheiro",
    "descricao": "Troca do reparo da descarga e conserto de sifão com vazamento sob a pia.",
    "status": "Pendente",
    "data_solicitacao": "2026-09-24T03:26:58.332Z"
  }
}

#### 2. Listar Serviços
- Método: GET
- URL: http://localhost:3000/api/servicos
- Body: none

#### 3. Aceitar serviço (Prestador)
- Método: PUT
- URL: http://localhost:3000/api/servicos/1/aceitar
- Body (JSON):
{
  "cod_prestador": 1
}

- Retorno da API (200 OK):
{
  "mensagem": "Serviço aceito pelo prestador!",
  "servico": {
    "id_servico": 1,
    "id_solicitante": 1,
    "cod_prestador": 1,
    "titulo": "Reparo de vazamento no banheiro",
    "status": "Em Andamento",
    "data_solicitacao": "2026-09-24T03:26:58.332Z"
  }
}

#### 4. Mudar status do serviço
- Método: PUT
- URL: http://localhost:3000/api/servicos/1/status
- Body (JSON):
{
  "status": "Concluído"
}
(Status válidos: "Pendente", "Em Andamento", "Concluído", "Cancelado")

- Retorno da API (200 OK):
{
  "mensagem": "Status atualizado!",
  "servico": {
    "id_servico": 1,
    "id_solicitante": 1,
    "cod_prestador": 1,
    "titulo": "Reparo de vazamento no banheiro",
    "status": "Concluído",
    "data_solicitacao": "2026-09-24T03:26:58.332Z"
  }
}

---

## Próximos passos / O que falta fazer

- Criptografar as senhas no banco usando bcrypt (por enquanto tá salvando em texto puro).
- Colocar autenticação com token JWT nas rotas.
- Fazer validação de campos no backend pra não quebrar com dados errados.

```