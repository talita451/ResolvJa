-- ============================================================
-- RESOLVJÁ
-- BANCO DE DADOS - NEON / POSTGRESQL
-- ============================================================

-- ============================================================
-- 1. APAGAR AS TABELAS ANTIGAS
-- ============================================================

DROP TABLE IF EXISTS solicitacao CASCADE;
DROP TABLE IF EXISTS servico CASCADE;
DROP TABLE IF EXISTS prestador_servico CASCADE;
DROP TABLE IF EXISTS tipo_servico CASCADE;
DROP TABLE IF EXISTS prestador CASCADE;
DROP TABLE IF EXISTS solicitante CASCADE;


-- ============================================================
-- 2. TABELA DE SOLICITANTES
-- ============================================================

CREATE TABLE solicitante (

    id_solicitante INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    cpf VARCHAR(14)
        UNIQUE NOT NULL,

    rg VARCHAR(20) NOT NULL,

    email VARCHAR(100)
        UNIQUE NOT NULL,

    data_nascimento DATE NOT NULL,

    telefone VARCHAR(20) NOT NULL,

    senha VARCHAR(255) NOT NULL,

    endereco TEXT NOT NULL,

    estado_civil VARCHAR(30),

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. TABELA DE PRESTADORES
-- ============================================================

CREATE TABLE prestador (

    cod_prestador INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    email VARCHAR(100)
        UNIQUE NOT NULL,

    cpf VARCHAR(14)
        UNIQUE NOT NULL,

    rg VARCHAR(20) NOT NULL,

    cnh VARCHAR(20),

    sexo VARCHAR(20),

    data_nascimento DATE NOT NULL,

    telefone VARCHAR(20) NOT NULL,

    escolaridade VARCHAR(50),

    endereco_completo TEXT NOT NULL,

    profissao_funcao VARCHAR(100) NOT NULL,

    experiencia VARCHAR(20) NOT NULL,

    descricao_funcoes TEXT,

    possui_equipamentos BOOLEAN NOT NULL,

    valor_minimo NUMERIC(10,2) NOT NULL,

    valor_maximo NUMERIC(10,2) NOT NULL,

    antecedentes_criminais TEXT,

    disponibilidade_horario VARCHAR(100) NOT NULL,

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_experiencia
        CHECK (
            experiencia IN (
                'básico',
                'intermediário',
                'avançado'
            )
        ),

    CONSTRAINT ck_valor
        CHECK (
            valor_minimo <= valor_maximo
        )
);


-- ============================================================
-- 4. CATÁLOGO DE SERVIÇOS
-- ============================================================

CREATE TABLE tipo_servico (

    id_tipo_servico INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nome VARCHAR(100)
        UNIQUE NOT NULL,

    descricao TEXT,

    ativo BOOLEAN
        DEFAULT TRUE,

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. SERVIÇOS QUE CADA PRESTADOR OFERECE
-- ============================================================

CREATE TABLE prestador_servico (

    id_prestador_servico INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    cod_prestador INTEGER NOT NULL,

    id_tipo_servico INTEGER NOT NULL,

    ativo BOOLEAN
        DEFAULT TRUE,

    CONSTRAINT fk_ps_prestador
        FOREIGN KEY (cod_prestador)
        REFERENCES prestador(cod_prestador)
        ON DELETE CASCADE,

    CONSTRAINT fk_ps_tipo_servico
        FOREIGN KEY (id_tipo_servico)
        REFERENCES tipo_servico(id_tipo_servico)
        ON DELETE CASCADE,

    CONSTRAINT uk_prestador_servico
        UNIQUE (
            cod_prestador,
            id_tipo_servico
        )
);


-- ============================================================
-- 6. SOLICITAÇÕES / CONTRATAÇÕES
-- ============================================================

CREATE TABLE solicitacao (

    id_solicitacao INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_solicitante INTEGER NOT NULL,

    id_tipo_servico INTEGER NOT NULL,

    cod_prestador INTEGER NOT NULL,

    data_servico DATE NOT NULL,

    horario VARCHAR(50) NOT NULL,

    endereco TEXT NOT NULL,

    descricao TEXT,

    valor_combinado NUMERIC(10,2),

    status VARCHAR(20)
        DEFAULT 'Pendente',

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_solicitacao_solicitante
        FOREIGN KEY (id_solicitante)
        REFERENCES solicitante(id_solicitante),

    CONSTRAINT fk_solicitacao_tipo_servico
        FOREIGN KEY (id_tipo_servico)
        REFERENCES tipo_servico(id_tipo_servico),

    CONSTRAINT fk_solicitacao_prestador
        FOREIGN KEY (cod_prestador)
        REFERENCES prestador(cod_prestador),

    CONSTRAINT ck_status_solicitacao
        CHECK (
            status IN (
                'Pendente',
                'Aceita',
                'Em Andamento',
                'Concluída',
                'Cancelada'
            )
        )
);


-- ============================================================
-- 7. SERVIÇOS INICIAIS DO RESOLVJÁ
-- ============================================================

INSERT INTO tipo_servico
    (nome, descricao)
VALUES
    (
        'Faxina',
        'Limpeza residencial e comercial'
    ),

    (
        'Eletricista',
        'Instalações e manutenção elétrica'
    ),

    (
        'Jardinagem',
        'Manutenção e cuidados com jardins'
    ),

    (
        'Pintura',
        'Pintura residencial e comercial'
    ),

    (
        'Encanador',
        'Serviços hidráulicos e reparos'
    );


-- ============================================================
-- 8. CONFERIR AS TABELAS
-- ============================================================

SELECT * FROM solicitante;

SELECT * FROM prestador;

SELECT * FROM tipo_servico;

SELECT * FROM prestador_servico;

SELECT * FROM solicitacao;