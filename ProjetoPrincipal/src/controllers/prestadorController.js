const bcrypt = require('bcryptjs');
const pool = require('../../banco');

class PrestadorController {
    async cadastrar(req, res) {
        try {
            const {
                nome, email, cpf, rg, cnh, sexo, data_nascimento, telefone,
                escolaridade, endereco_completo, profissao_funcao, experiencia,
                descricao_funcoes, possui_equipamentos, valor_minimo, valor_maximo,
                antecedentes_criminais, disponibilidade_horario, senha, foto_perfil
            } = req.body;

            if (!senha) {
                return res.status(400).json({ erro: 'A senha é obrigatória.' });
            }

            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            const query = `
                INSERT INTO prestador (
                    nome, email, cpf, rg, cnh, sexo, data_nascimento, telefone,
                    escolaridade, endereco_completo, profissao_funcao, experiencia,
                    descricao_funcoes, possui_equipamentos, valor_minimo, valor_maximo,
                    antecedentes_criminais, disponibilidade_horario, senha, foto_perfil
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                RETURNING cod_prestador, nome, email, profissao_funcao, foto_perfil, criado_em;
            `;

            const values = [
                nome, email, cpf, rg, cnh || null, sexo || 'Não informado', data_nascimento, telefone,
                escolaridade || null, endereco_completo, profissao_funcao, experiencia,
                descricao_funcoes || null, possui_equipamentos, valor_minimo, valor_maximo,
                antecedentes_criminais || null, disponibilidade_horario, senhaHash, foto_perfil || null
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

    async listar(req, res) {
        try {
            const resultado = await pool.query('SELECT cod_prestador, nome, email, cpf, rg, data_nascimento, telefone, profissao_funcao, experiencia, valor_minimo, valor_maximo, disponibilidade_horario, endereco_completo, foto_perfil FROM prestador ORDER BY cod_prestador DESC');
            return res.json(resultado.rows);
        } catch (erro) {
            console.error('Erro ao listar prestadores:', erro);
            return res.status(500).json({ erro: 'Erro interno ao buscar prestadores no banco de dados.' });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            
            // 1. Busca os dados atuais do prestador para não perder colunas que não vieram no formulário
            const prestadorAtualRes = await pool.query('SELECT * FROM prestador WHERE cod_prestador = $1', [id]);
            if (prestadorAtualRes.rows.length === 0) {
                return res.status(404).json({ erro: 'Prestador não encontrado.' });
            }
            const atual = prestadorAtualRes.rows[0];

            // 2. Extrai os dados enviados pelo corpo da requisição (mantendo os antigos caso algum venha vazio/undefined)
            const {
                nome, email, telefone, endereco_completo, profissao_funcao,
                experiencia, valor_minimo, valor_maximo, disponibilidade_horario, foto_perfil
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
            
            // Se veio uma nova foto de perfil, usa-a; caso contrário, preserva a foto anterior
            const novaFoto = (foto_perfil !== undefined && foto_perfil !== '') ? foto_perfil : atual.foto_perfil;

            const query = `
                UPDATE prestador SET
                    nome = $1, email = $2, telefone = $3, endereco_completo = $4,
                    profissao_funcao = $5, experiencia = $6, valor_minimo = $7,
                    valor_maximo = $8, disponibilidade_horario = $9, foto_perfil = $10
                WHERE cod_prestador = $11
                RETURNING *;
            `;

            const values = [
                novoNome, novoEmail, novoTelefone, novoEndereco,
                novaProfissao, novaExperiencia, novoValorMin,
                novoValorMax, novaDisponibilidade, novaFoto, id
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

    async vincularServico(req, res) {
        try {
            const { id } = req.params;
            const { id_servico } = req.body;

            const query = `
                INSERT INTO prestador_servico (cod_prestador, id_servico)
                VALUES ($1, $2)
                RETURNING *;
            `;
            const resultado = await pool.query(query, [id, id_servico]);
            return res.status(201).json({
                mensagem: 'Serviço vinculado com sucesso!',
                vinculo: resultado.rows[0]
            });
        } catch (erro) {
            console.error('Erro ao vincular serviço:', erro);
            return res.status(500).json({ erro: 'Erro interno ao vincular serviço ao prestador.' });
        }
    }

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