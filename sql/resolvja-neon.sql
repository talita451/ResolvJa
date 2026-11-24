-- ============================================================
-- RESOLVJÁ
-- BANCO DE DADOS ATUALIZADO - NEON / POSTGRESQL
-- ============================================================

-- ============================================================
-- 1. APAGAR AS TABELAS ANTIGAS
-- ============================================================

DROP TABLE IF EXISTS avaliacao_site CASCADE;
DROP TABLE IF EXISTS solicitacao CASCADE;
DROP TABLE IF EXISTS servico CASCADE;
DROP TABLE IF EXISTS prestador_servico CASCADE;
DROP TABLE IF EXISTS tipo_servico CASCADE;
DROP TABLE IF EXISTS prestador CASCADE;
DROP TABLE IF EXISTS solicitante CASCADE;


-- ============================================================
-- 2. TABELA DE SOLICITANTES (CLIENTES)
-- ============================================================

CREATE TABLE solicitante (

    id_solicitante INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    cpf VARCHAR(20)
        UNIQUE NOT NULL,

    rg VARCHAR(20) NOT NULL,

    email VARCHAR(150)
        UNIQUE NOT NULL,

    data_nascimento DATE NOT NULL,

    telefone VARCHAR(30) NOT NULL,

    senha VARCHAR(255) NOT NULL,

    endereco TEXT NOT NULL,

    estado_civil VARCHAR(50),

    foto_perfil TEXT,

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. TABELA DE PRESTADORES (PROFISSIONAIS)
-- ============================================================

CREATE TABLE prestador (

    cod_prestador INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    email VARCHAR(150)
        UNIQUE NOT NULL,

    cpf VARCHAR(20)
        UNIQUE NOT NULL,

    rg VARCHAR(20) NOT NULL,

    cnh VARCHAR(30),

    sexo VARCHAR(30),

    data_nascimento DATE NOT NULL,

    telefone VARCHAR(30) NOT NULL,

    escolaridade VARCHAR(100),

    endereco_completo TEXT NOT NULL,

    profissao_funcao VARCHAR(150) NOT NULL,

    experiencia VARCHAR(100),

    descricao_funcoes TEXT,

    possui_equipamentos BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    valor_minimo NUMERIC(10,2) NOT NULL,

    valor_maximo NUMERIC(10,2) NOT NULL,

    antecedentes_criminais TEXT,

    disponibilidade_horario VARCHAR(150) NOT NULL,

    senha VARCHAR(255),

    foto_perfil TEXT,

    formas_pagamento VARCHAR(255)
        DEFAULT 'A combinar',

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

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

    nome VARCHAR(150)
        UNIQUE NOT NULL,

    descricao TEXT,

    ativo BOOLEAN
        DEFAULT TRUE,

    preco_a_partir NUMERIC(10,2)
        DEFAULT 50.00,

    imagem_url TEXT,

    categoria VARCHAR(100)
        DEFAULT 'Geral',

    foto TEXT,

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. SERVIÇOS QUE CADA PRESTADOR OFERECE (N:N)
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
-- 6. SOLICITAÇÕES / CONTRATAÇÕES E AVALIAÇÕES DE SERVIÇO
-- ============================================================

CREATE TABLE solicitacao (

    id_solicitacao INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_solicitante INTEGER NOT NULL,

    id_tipo_servico INTEGER NOT NULL,

    cod_prestador INTEGER,

    data_servico DATE NOT NULL,

    horario VARCHAR(50) NOT NULL,

    endereco TEXT NOT NULL,

    descricao TEXT,

    valor_combinado NUMERIC(10,2),

    status VARCHAR(100)
        DEFAULT 'Pendente',

    nota_avaliacao INTEGER,

    comentario_avaliacao TEXT,

    foto_avaliacao TEXT,

    resposta_avaliacao TEXT,

    forma_pagamento VARCHAR(100),

    motivo_cancelamento TEXT,

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_solicitacao_solicitante
        FOREIGN KEY (id_solicitante)
        REFERENCES solicitante(id_solicitante)
        ON DELETE CASCADE,

    CONSTRAINT fk_solicitacao_tipo_servico
        FOREIGN KEY (id_tipo_servico)
        REFERENCES tipo_servico(id_tipo_servico)
        ON DELETE RESTRICT,

    CONSTRAINT fk_solicitacao_prestador
        FOREIGN KEY (cod_prestador)
        REFERENCES prestador(cod_prestador)
        ON DELETE SET NULL,

    CONSTRAINT ck_nota_avaliacao
        CHECK (
            nota_avaliacao IS NULL
            OR (nota_avaliacao >= 1 AND nota_avaliacao <= 5)
        )
);


-- ============================================================
-- 7. AVALIAÇÕES GERAIS DA PLATAFORMA (SITE)
-- ============================================================

CREATE TABLE avaliacao_site (

    id_avaliacao INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_usuario INTEGER,

    nome_usuario VARCHAR(150),

    nota INTEGER NOT NULL,

    comentario TEXT,

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_nota_avaliacao_site
        CHECK (
            nota >= 1 AND nota <= 5
        )
);


-- ============================================================
-- 8. CARGA INICIAL DO CATÁLOGO DE SERVIÇOS (SEM DUPLICATAS)
-- ============================================================

INSERT INTO tipo_servico
    (nome, descricao, preco_a_partir, categoria, imagem_url)
VALUES
    (
        'Eletricista',
        'Instalações elétricas, tomadas, disjuntores e reparos em geral.',
        80.00,
        'Elétrica',
        'assets/servicos/eletricista.jpg'
    ),
    (
        'Encanador',
        'Reparo de vazamentos, torneiras, registros e tubulações hidráulicas.',
        80.00,
        'Hidráulica',
        'assets/servicos/encanador.jpg'
    ),
    (
        'Faxina / Limpeza Residencial',
        'Limpeza completa de casas, apartamentos e ambientes internos.',
        120.00,
        'Limpeza',
        'assets/servicos/faxina-limpeza-residencial.jpg'
    ),
    (
        'Jardinagem',
        'Poda, corte de grama, limpeza e manutenção de jardins.',
        90.00,
        'Jardim',
        'assets/servicos/jardinagem.jpg'
    ),
    (
        'Pintura',
        'Pintura interna e externa de paredes, portas e grades.',
        150.00,
        'Reforma',
        'assets/servicos/pintura.jpg'
    ),
    (
        'Marcenaria',
        'Reparos em móveis de madeira, portas, armários e sob medida.',
        100.00,
        'Reparos',
        'assets/servicos/marcenaria.jpg'
    ),
    (
        'Pedreiro',
        'Pequenas reformas, alvenaria, reboco e assentamento de pisos.',
        150.00,
        'Reforma',
        'assets/servicos/pedreiro.jpg'
    ),
    (
        'Montagem de Móveis',
        'Montagem e desmontagem de guarda-roupas, estantes e móveis em geral.',
        80.00,
        'Reparos',
        'assets/servicos/montagem-moveis.jpg'
    ),
    (
        'Troca de Lâmpadas e Luminárias',
        'Substituição de lâmpadas, lustres, spots e luminárias.',
        50.00,
        'Elétrica',
        'assets/servicos/troca-lampadas-luminarias.jpg'
    ),
    (
        'Manutenção de Chuveiro',
        'Troca de resistência, instalação e reparo de chuveiros elétricos.',
        60.00,
        'Elétrica',
        'assets/servicos/manutencao-chuveiro.jpg'
    ),
    (
        'Instalação de Varal',
        'Instalação e ajuste de varais de teto ou parede.',
        60.00,
        'Reparos',
        'assets/servicos/instalacao-varal.jpg'
    ),
    (
        'Passadeira de Roupa',
        'Serviço de passar roupas residenciais por diária ou peças.',
        80.00,
        'Limpeza',
        'assets/servicos/passadeira-roupa.jpg'
    ),
    (
        'Camareira',
        'Organização e arrumação de quartos e ambientes.',
        100.00,
        'Limpeza',
        'assets/servicos/camareira.jpg'
    ),
    (
        'Controle de Pragas',
        'Dedetização e controle preventivo de insetos e pragas.',
        140.00,
        'Limpeza',
        'assets/servicos/controle-pragas.jpg'
    ),
    (
        'Técnico em Informática',
        'Formatação, manutenção de computadores, redes e suporte técnico.',
        90.00,
        'Tecnologia',
        'assets/servicos/tecnico-em-informatica.jpg'
    ),
    (
        'Manicure e Pedicure',
        'Cuidados com unhas das mãos e pés em domicílio.',
        50.00,
        'Beleza',
        'assets/servicos/manicure-pedicure.jpg'
    ),
    (
        'Cabeleireiro e Estética',
        'Corte, escova e cuidados capilares e estéticos.',
        70.00,
        'Beleza',
        'assets/servicos/cabeleireiro-estetica.jpg'
    ),
    (
        'Babá / Cuidadora Infantil',
        'Acompanhamento e cuidados com crianças em domicílio.',
        100.00,
        'Cuidados',
        'assets/servicos/baba-cuidadora-infantil.jpg'
    ),
    (
        'Cuidador de Idosos',
        'Assistência, companhia e cuidados diários para idosos.',
        120.00,
        'Cuidados',
        'assets/servicos/cuidador-idosos.jpg'
    ),
    (
        'Passeador de Cães',
        'Passeios seguros e rotina de exercícios para pets.',
        40.00,
        'Pets',
        'assets/servicos/passeador-caes.jpg'
    ),
    (
        'Ajudante de Mudança',
        'Apoio no carregamento, organização e transporte de móveis.',
        100.00,
        'Transporte',
        'assets/servicos/ajudante-mudanca.jpg'
    ),
    (
        'Frete e Carretos',
        'Transporte rápido de móveis, eletrodomésticos e encomendas.',
        120.00,
        'Transporte',
        'assets/servicos/frete-carretos.jpg'
    ),
    (
        'Motorista Particular',
        'Transporte agendado para compromissos e viagens locais.',
        80.00,
        'Transporte',
        'assets/servicos/motorista-particular.jpg'
    ),
    (
        'Mecânico de Urgência',
        'Socorro mecânico básico e reparos emergenciais.',
        120.00,
        'Automotivo',
        'assets/servicos/mecanico-urgencia.jpg'
    ),
    (
        'Cozinheiro / Personal Diet',
        'Preparo de refeições caseiras ou marmitas planejadas.',
        130.00,
        'Culinária',
        'assets/servicos/cozinheiro-personal-diet.jpg'
    ),
    (
        'Acompanhante de Compras',
        'Apoio e companhia para compras em supermercados e lojas.',
        60.00,
        'Apoio',
        'assets/servicos/acompanhante-compras.jpg'
    ),
    (
        'Acompanhante de Consultas',
        'Companhia e auxílio em idas a consultas médicas e exames.',
        70.00,
        'Apoio',
        'assets/servicos/acompanhante-consultas.jpg'
    );


-- ============================================================
-- 9. CONFERIR TODAS AS TABELAS CRIADAS
-- ============================================================

SELECT * FROM solicitante;

SELECT * FROM prestador;

SELECT * FROM tipo_servico;

SELECT * FROM prestador_servico;

SELECT * FROM solicitacao;

SELECT * FROM avaliacao_site;
