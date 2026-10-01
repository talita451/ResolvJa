const express = require('express');
const router = express.Router();
const pool = require('./banco.js');

// ======================================================
// SOLICITANTES
// ======================================================

router.post('/solicitantes', async (req, res) => {
    const {
        nome,
        cpf,
        rg,
        email,
        data_nascimento,
        telefone,
        senha,
        endereco,
        estado_civil
    } = req.body;

    try {
        const query = `
            INSERT INTO solicitante
            (
                nome,
                cpf,
                rg,
                email,
                data_nascimento,
                telefone,
                senha,
                endereco,
                estado_civil
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id_solicitante, nome, email, telefone, endereco;
        `;

        const values = [
            nome,
            cpf,
            rg,
            email,
            data_nascimento,
            telefone,
            senha,
            endereco,
            estado_civil
        ];

        const { rows } = await pool.query(query, values);

        res.status(201).json({
            mensagem: 'Solicitante cadastrado com sucesso!',
            solicitante: rows[0]
        });

    } catch (error) {
        res.status(500).json({
            erro: error.message
        });
    }
});


// Listar solicitantes
router.get('/solicitantes', async (req, res) => {

    try {

        const query = `
            SELECT
                id_solicitante,
                nome,
                email,
                telefone,
                endereco
            FROM solicitante
            ORDER BY nome;
        `;

        const { rows } = await pool.query(query);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// ======================================================
// PRESTADORES
// ======================================================

router.post('/prestadores', async (req, res) => {

    const {
        nome,
        email,
        cpf,
        rg,
        cnh,
        sexo,
        data_nascimento,
        telefone,
        escolaridade,
        endereco_completo,
        profissao_funcao,
        experiencia,
        descricao_funcoes,
        possui_equipamentos,
        valor_minimo,
        valor_maximo,
        antecedentes_criminais,
        disponibilidade_horario
    } = req.body;

    try {

        const query = `
            INSERT INTO prestador
            (
                nome,
                email,
                cpf,
                rg,
                cnh,
                sexo,
                data_nascimento,
                telefone,
                escolaridade,
                endereco_completo,
                profissao_funcao,
                experiencia,
                descricao_funcoes,
                possui_equipamentos,
                valor_minimo,
                valor_maximo,
                antecedentes_criminais,
                disponibilidade_horario
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16, $17, $18
            )
            RETURNING
                cod_prestador,
                nome,
                email,
                profissao_funcao,
                experiencia,
                valor_minimo,
                valor_maximo,
                disponibilidade_horario,
                criado_em;
        `;

        const values = [
            nome,
            email,
            cpf,
            rg,
            cnh,
            sexo,
            data_nascimento,
            telefone,
            escolaridade,
            endereco_completo,
            profissao_funcao,
            experiencia,
            descricao_funcoes,
            possui_equipamentos,
            valor_minimo,
            valor_maximo,
            antecedentes_criminais,
            disponibilidade_horario
        ];

        const { rows } = await pool.query(query, values);

        res.status(201).json({
            mensagem: 'Prestador cadastrado com sucesso!',
            prestador: rows[0]
        });

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// Listar prestadores
router.get('/prestadores', async (req, res) => {

    try {

        const query = `
            SELECT
                cod_prestador,
                nome,
                email,
                telefone,
                profissao_funcao,
                experiencia,
                descricao_funcoes,
                possui_equipamentos,
                valor_minimo,
                valor_maximo,
                disponibilidade_horario
            FROM prestador
            ORDER BY nome;
        `;

        const { rows } = await pool.query(query);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// ======================================================
// TIPOS DE SERVIÇO
// ======================================================

// Listar serviços disponíveis
router.get('/servicos', async (req, res) => {

    try {

        const query = `
            SELECT
                id_tipo_servico,
                nome,
                descricao
            FROM tipo_servico
            WHERE ativo = TRUE
            ORDER BY nome;
        `;

        const { rows } = await pool.query(query);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// Cadastrar novo serviço
router.post('/servicos', async (req, res) => {

    const {
        nome,
        descricao
    } = req.body;

    try {

        const query = `
            INSERT INTO tipo_servico
            (
                nome,
                descricao
            )
            VALUES ($1, $2)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            nome,
            descricao
        ]);

        res.status(201).json({
            mensagem: 'Serviço cadastrado com sucesso!',
            servico: rows[0]
        });

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// ======================================================
// SERVIÇOS DO PRESTADOR
// ======================================================

// Vincular serviço ao prestador
router.post('/prestadores/:id/servicos', async (req, res) => {

    const { id } = req.params;
    const { id_tipo_servico } = req.body;

    try {

        const query = `
            INSERT INTO prestador_servico
            (
                cod_prestador,
                id_tipo_servico
            )
            VALUES ($1, $2)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            id,
            id_tipo_servico
        ]);

        res.status(201).json({
            mensagem: 'Serviço vinculado ao prestador!',
            prestador_servico: rows[0]
        });

    } catch (error) {

        if (error.code === '23505') {

            return res.status(400).json({
                erro: 'Este prestador já oferece este serviço.'
            });
        }

        res.status(500).json({
            erro: error.message
        });
    }
});


// Listar serviços de um prestador
router.get('/prestadores/:id/servicos', async (req, res) => {

    const { id } = req.params;

    try {

        const query = `
            SELECT
                ts.id_tipo_servico,
                ts.nome,
                ts.descricao
            FROM prestador_servico ps
            INNER JOIN tipo_servico ts
                ON ps.id_tipo_servico = ts.id_tipo_servico
            WHERE ps.cod_prestador = $1
            AND ps.ativo = TRUE
            ORDER BY ts.nome;
        `;

        const { rows } = await pool.query(query, [id]);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// ======================================================
// PRESTADORES DE UM SERVIÇO
// ======================================================

router.get('/servicos/:id/prestadores', async (req, res) => {

    const { id } = req.params;

    try {

        const query = `
            SELECT
                p.cod_prestador,
                p.nome,
                p.email,
                p.telefone,
                p.profissao_funcao,
                p.experiencia,
                p.descricao_funcoes,
                p.possui_equipamentos,
                p.valor_minimo,
                p.valor_maximo,
                p.disponibilidade_horario
            FROM prestador p
            INNER JOIN prestador_servico ps
                ON p.cod_prestador = ps.cod_prestador
            WHERE ps.id_tipo_servico = $1
            AND ps.ativo = TRUE
            ORDER BY p.nome;
        `;

        const { rows } = await pool.query(query, [id]);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// ======================================================
// SOLICITAÇÕES
// ======================================================

// Criar solicitação
router.post('/solicitacoes', async (req, res) => {

    const {
        id_solicitante,
        id_tipo_servico,
        cod_prestador,
        data_servico,
        horario,
        endereco,
        descricao,
        valor_combinado
    } = req.body;

    try {

        const query = `
            INSERT INTO solicitacao
            (
                id_solicitante,
                id_tipo_servico,
                cod_prestador,
                data_servico,
                horario,
                endereco,
                descricao,
                valor_combinado
            )
            VALUES
            (
                $1, $2, $3, $4,
                $5, $6, $7, $8
            )
            RETURNING *;
        `;

        const values = [
            id_solicitante,
            id_tipo_servico,
            cod_prestador,
            data_servico,
            horario,
            endereco,
            descricao,
            valor_combinado
        ];

        const { rows } = await pool.query(query, values);

        res.status(201).json({
            mensagem: 'Solicitação criada com sucesso!',
            solicitacao: rows[0]
        });

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// Listar solicitações
router.get('/solicitacoes', async (req, res) => {

    try {

        const query = `
            SELECT
                s.id_solicitacao,
                sol.nome AS solicitante_nome,
                ts.nome AS servico,
                p.nome AS prestador_nome,
                s.data_servico,
                s.horario,
                s.endereco,
                s.descricao,
                s.valor_combinado,
                s.status,
                s.criado_em
            FROM solicitacao s
            INNER JOIN solicitante sol
                ON s.id_solicitante = sol.id_solicitante
            INNER JOIN tipo_servico ts
                ON s.id_tipo_servico = ts.id_tipo_servico
            INNER JOIN prestador p
                ON s.cod_prestador = p.cod_prestador
            ORDER BY s.criado_em DESC;
        `;

        const { rows } = await pool.query(query);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// Solicitações de um solicitante
router.get('/solicitantes/:id/solicitacoes', async (req, res) => {

    const { id } = req.params;

    try {

        const query = `
            SELECT
                s.id_solicitacao,
                ts.nome AS servico,
                p.nome AS prestador_nome,
                p.telefone AS prestador_telefone,
                s.data_servico,
                s.horario,
                s.endereco,
                s.descricao,
                s.valor_combinado,
                s.status,
                s.criado_em
            FROM solicitacao s
            INNER JOIN tipo_servico ts
                ON s.id_tipo_servico = ts.id_tipo_servico
            INNER JOIN prestador p
                ON s.cod_prestador = p.cod_prestador
            WHERE s.id_solicitante = $1
            ORDER BY s.criado_em DESC;
        `;

        const { rows } = await pool.query(query, [id]);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// Solicitações de um prestador
router.get('/prestadores/:id/solicitacoes', async (req, res) => {

    const { id } = req.params;

    try {

        const query = `
            SELECT
                s.id_solicitacao,
                sol.nome AS solicitante_nome,
                sol.telefone AS solicitante_telefone,
                ts.nome AS servico,
                s.data_servico,
                s.horario,
                s.endereco,
                s.descricao,
                s.valor_combinado,
                s.status,
                s.criado_em
            FROM solicitacao s
            INNER JOIN solicitante sol
                ON s.id_solicitante = sol.id_solicitante
            INNER JOIN tipo_servico ts
                ON s.id_tipo_servico = ts.id_tipo_servico
            WHERE s.cod_prestador = $1
            ORDER BY s.data_servico ASC;
        `;

        const { rows } = await pool.query(query, [id]);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// Alterar status da solicitação
router.put('/solicitacoes/:id/status', async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    try {

        const query = `
            UPDATE solicitacao
            SET status = $1
            WHERE id_solicitacao = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            status,
            id
        ]);

        if (rows.length === 0) {

            return res.status(404).json({
                erro: 'Solicitação não encontrada.'
            });
        }

        res.json({
            mensagem: 'Status atualizado com sucesso!',
            solicitacao: rows[0]
        });

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });
    }
});


// ======================================================
// EXPORTAR ROUTER
// ======================================================

module.exports = router;