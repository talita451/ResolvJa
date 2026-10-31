const pool = require('../../banco'); // Certifique-se de que o caminho aponta para o seu arquivo de conexão do banco

// 1. Cadastrar um novo prestador
exports.cadastrar = async (req, res) => {
    try {
        const {
            nome, email, cpf, rg, cnh, sexo, data_nascimento, telefone,
            escolaridade, endereco_completo, profissao_funcao, experiencia,
            descricao_funcoes, possui_equipamentos, valor_minimo, valor_maximo,
            antecedentes_criminais, disponibilidade_horario
        } = req.body;

        const query = `
            INSERT INTO prestador (
                nome, email, cpf, rg, cnh, sexo, data_nascimento, telefone,
                escolaridade, endereco_completo, profissao_funcao, experiencia,
                descricao_funcoes, possui_equipamentos, valor_minimo, valor_maximo,
                antecedentes_criminais, disponibilidade_horario
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;

        const values = [
            nome, email, cpf, rg, cnh || null, sexo || 'Não informado', data_nascimento, telefone,
            escolaridade || null, endereco_completo, profissao_funcao, experiencia,
            descricao_funcoes || null, possui_equipamentos, valor_minimo, valor_maximo,
            antecedentes_criminais || null, disponibilidade_horario
        ];

        const resultado = await pool.query(query, values);
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao cadastrar prestador:', erro);
        if (erro.code === '23505') {
            return res.status(400).json({ erro: 'E-mail ou CPF já cadastrados no sistema.' });
        }
        res.status(500).json({ erro: 'Erro interno ao cadastrar prestador no banco de dados.' });
    }
};

// 2. Listar todos os prestadores cadastrados (GET /api/prestadores)
exports.listar = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM prestador ORDER BY cod_prestador DESC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar prestadores:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar prestadores no banco de dados.' });
    }
};

// 3. Vincular serviço ao prestador
exports.vincularServico = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_servico } = req.body;

        const query = `
            INSERT INTO prestador_servico (cod_prestador, id_servico)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const resultado = await pool.query(query, [id, id_servico]);
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao vincular serviço:', erro);
        res.status(500).json({ erro: 'Erro interno ao vincular serviço ao prestador.' });
    }
};

// 4. Listar serviços de um prestador específico
exports.listarServicos = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT s.* FROM servicos s
            JOIN prestador_servico ps ON s.id = ps.id_servico
            WHERE ps.cod_prestador = $1;
        `;
        const resultado = await pool.query(query, [id]);
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar serviços do prestador:', erro);
        res.status(500).json({ erro: 'Erro interno ao buscar serviços do prestador.' });
    }
};