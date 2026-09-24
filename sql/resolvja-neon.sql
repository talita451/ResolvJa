-- ============================================
-- RESOLVJÁ - NEON / POSTGRESQL
-- Execute este arquivo no SQL Editor do Neon
-- ============================================

CREATE TABLE IF NOT EXISTS solicitante (
    id_solicitante INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    estado_civil VARCHAR(30),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prestador (
    cod_prestador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20) NOT NULL,
    cnh VARCHAR(20),
    sexo VARCHAR(20),
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    escolaridade VARCHAR(50),
    endereco_completo TEXT NOT NULL,
    profissao_funcao VARCHAR(100) NOT NULL,
    experiencia VARCHAR(20) NOT NULL
        CHECK (experiencia IN ('básico', 'intermediário', 'avançado')),
    descricao_funcoes TEXT,
    possui_equipamentos BOOLEAN NOT NULL,
    valor_minimo NUMERIC(10,2) NOT NULL,
    valor_maximo NUMERIC(10,2) NOT NULL,
    antecedentes_criminais TEXT,
    disponibilidade_horario VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_valor_prestador
        CHECK (valor_minimo <= valor_maximo)
);

CREATE TABLE IF NOT EXISTS servico (
    id_servico INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_solicitante INTEGER NOT NULL,
    cod_prestador INTEGER,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'Pendente'
        CHECK (status IN (
            'Pendente',
            'Em Andamento',
            'Concluído',
            'Cancelado'
        )),
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_servico_solicitante
        FOREIGN KEY (id_solicitante)
        REFERENCES solicitante(id_solicitante),

    CONSTRAINT fk_servico_prestador
        FOREIGN KEY (cod_prestador)
        REFERENCES prestador(cod_prestador)
);

-- Testes rápidos:
SELECT * FROM solicitante;
SELECT * FROM prestador;
SELECT * FROM servico;
