// src/controllers/prestadorController.js
const bcrypt = require('bcryptjs');
const pool = require('../../banco');
const { salvarImagemEmPasta } = require('../utils/salvarImagem');

class PrestadorController {
    // Cadastra novo prestador salvando a foto na pasta /uploads e registrando as formas de pagamento
    async cadastrar(req, res) {
        try {
            const {
                nome, email, cpf, rg, cnh, sexo, data_nascimento, telefone,
                escolaridade, endereco_completo, profissao_funcao, experiencia,
                descricao_funcoes, possui_equipamentos, valor_minimo, valor_maximo,
                antecedentes_criminais, disponibilidade_horario, senha, foto_perfil,
                formas_pagamento
            } = req.body;

            if (!senha) {
                return res.status(400).json({ erro: 'A senha é obrigatória.' });
            }

            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            // Salva a foto fisicamente na pasta uploads e grava apenas o caminho no banco
            const caminhoFoto = salvarImagemEmPasta(foto_perfil, 'perfil');

            const query = `
                INSERT INTO prestador (
                    nome, email, cpf, rg, cnh, sexo, data_nascimento, telefone,
                    escolaridade, endereco_completo, profissao_funcao, experiencia,
                    descricao_funcoes, possui_equipamentos, valor_minimo, valor_maximo,
                    antecedentes_criminais, disponibilidade_horario, senha, foto_perfil,
                    formas_pagamento
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                RETURNING cod_prestador, nome, email, profissao_funcao, foto_perfil, formas_pagamento, criado_em;
            `;

            const values = [
                nome, email, cpf, rg, cnh || null, sexo || 'Não informado', data_nascimento, telefone,
                escolaridade || null, endereco_completo, profissao_funcao, experiencia,
                descricao_funcoes || null, possui_equipamentos, valor_minimo, valor_maximo,
                antecedentes_criminais || null, disponibilidade_horario, senhaHash, caminhoFoto,
                formas_pagamento || 'A combinar'
            ];

            const resultado = await pool.query(query, values);

            return res.status(201).json({
                mensagem: 'Prestador cadastrado com sucesso!',
                prestador: resultado.rows[0]
            });

        } catch (erro) {
            console.error('Erro ao cadastrar prestador:', erro);
            if (erro.code === '23505') {
                return res.status(400).json({ erro: 'E-mail ou CPF já cadastrados no sistema.' });
            }
            return res.status(500).json({ erro: 'Erro interno ao cadastrar prestador no banco de dados.' });
        }
    }

    // Lista todos os prestadores cadastrados
    async listar(req, res) {
        try {
            const resultado = await pool.query(`
                SELECT cod_prestador, nome, email, cpf, rg, data_nascimento, telefone,
                       profissao_funcao, experiencia, descricao_funcoes, valor_minimo,
                       valor_maximo, disponibilidade_horario, endereco_completo,
                       foto_perfil, formas_pagamento
                FROM prestador
                ORDER BY cod_prestador DESC
            `);
            return res.json(resultado.rows);
        } catch (erro) {
            console.error('Erro ao listar prestadores:', erro);
            return res.status(500).json({ erro: 'Erro interno ao buscar prestadores no banco de dados.' });
        }
    }

    // Busca um prestador específico pelo ID (corrige o carregamento da página Meu Perfil)
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const resultado = await pool.query(`
                SELECT cod_prestador, nome, email, cpf, rg, data_nascimento, telefone,
                       profissao_funcao, experiencia, descricao_funcoes, valor_minimo,
                       valor_maximo, disponibilidade_horario, endereco_completo,
                       foto_perfil, formas_pagamento
                FROM prestador
                WHERE cod_prestador = $1
            `, [id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ erro: 'Prestador não encontrado.' });
            }

            return res.json(resultado.rows[0]);
        } catch (erro) {
            console.error('Erro ao buscar prestador por ID:', erro);
            return res.status(500).json({ erro: 'Erro interno ao buscar dados do prestador.' });
        }
    }

    // Atualiza os dados do prestador mantendo os valores antigos quando não enviados
    async atualizar(req, res) {
        try {
            const { id } = req.params;

            // 1. Busca os dados atuais do prestador
            const prestadorAtualRes = await pool.query('SELECT * FROM prestador WHERE cod_prestador = $1', [id]);
            if (prestadorAtualRes.rows.length === 0) {
                return res.status(404).json({ erro: 'Prestador não encontrado.' });
            }
            const atual = prestadorAtualRes.rows[0];

            // 2. Extrai os dados enviados pelo formulário
            const {
                nome, email, telefone, endereco_completo, profissao_funcao,
                experiencia, valor_minimo, valor_maximo, disponibilidade_horario,
                foto_perfil, formas_pagamento
            } = req.body;

            const novoNome = nome !== undefined ? nome : atual.nome;
            const novoEmail = email !== undefined ? email : atual.email;
            const novoTelefone = telefone !== undefined ? telefone : atual.telefone;
            const novoEndereco = endereco_completo !== undefined ? endereco_completo : atual.endereco_completo;
            const novaProfissao = profissao_funcao !== undefined ? profissao_funcao : atual.profissao_funcao;
            const novaExperiencia = experiencia !== undefined ? experiencia : atual.experiencia;
            const novoValorMin = valor_minimo !== undefined ? valor_minimo : atual.valor_minimo;
            const novoValorMax = valor_maximo !== undefined ? valor_maximo : atual.valor_maximo;
            const novaDisponibilidade = disponibilidade_horario !== undefined ? disponibilidade_horario : atual.disponibilidade_horario;
            const novasFormasPagamento = formas_pagamento !== undefined ? formas_pagamento : atual.formas_pagamento;

            // Salva a nova foto na pasta /uploads se enviada; caso contrário, mantém a anterior
            let novaFoto = atual.foto_perfil;
            if (foto_perfil !== undefined && foto_perfil !== '') {
                novaFoto = salvarImagemEmPasta(foto_perfil, 'perfil') || atual.foto_perfil;
            }

            const query = `
                UPDATE prestador SET
                    nome = $1, email = $2, telefone = $3, endereco_completo = $4,
                    profissao_funcao = $5, experiencia = $6, valor_minimo = $7,
                    valor_maximo = $8, disponibilidade_horario = $9, foto_perfil = $10,
                    formas_pagamento = $11
                WHERE cod_prestador = $12
                RETURNING cod_prestador, nome, email, telefone, endereco_completo,
                          profissao_funcao, experiencia, valor_minimo, valor_maximo,
                          disponibilidade_horario, foto_perfil, formas_pagamento;
            `;

            const values = [
                novoNome, novoEmail, novoTelefone, novoEndereco,
                novaProfissao, novaExperiencia, novoValorMin,
                novoValorMax, novaDisponibilidade, novaFoto, novasFormasPagamento, id
            ];

            const resultado = await pool.query(query, values);

            return res.json({
                mensagem: 'Cadastro atualizado com sucesso!',
                prestador: resultado.rows[0]
            });
        } catch (erro) {
            console.error('Erro ao atualizar prestador:', erro);
            return res.status(500).json({ erro: 'Erro interno ao atualizar dados.' });
        }
    }

    // Vincula um serviço ao prestador (corrigido nome da coluna para id_tipo_servico)
    async vincularServico(req, res) {
        try {
            const { id } = req.params;
            const { id_tipo_servico, id_servico } = req.body;
            const idFinal = id_tipo_servico || id_servico;

            const query = `
                INSERT INTO prestador_servico (cod_prestador, id_tipo_servico)
                VALUES ($1, $2)
                RETURNING *;
            `;
            const resultado = await pool.query(query, [id, idFinal]);
            return res.status(201).json({
                mensagem: 'Serviço vinculado com sucesso!',
                vinculo: resultado.rows[0]
            });
        } catch (erro) {
            console.error('Erro ao vincular serviço:', erro);
            return res.status(500).json({ erro: 'Erro interno ao vincular serviço ao prestador.' });
        }
    }

    // Lista os serviços vinculados ao prestador
    async listarServicos(req, res) {
        try {
            const { id } = req.params;
            const query = `
                SELECT s.* FROM tipo_servico s
                JOIN prestador_servico ps ON s.id_tipo_servico = ps.id_tipo_servico
                WHERE ps.cod_prestador = $1;
            `;
            const resultado = await pool.query(query, [id]);
            return res.json(resultado.rows);
        } catch (erro) {
            console.error('Erro ao listar serviços do prestador:', erro);
            return res.status(500).json({ erro: 'Erro interno ao buscar serviços do prestador.' });
        }
    }
}

module.exports = new PrestadorController();
