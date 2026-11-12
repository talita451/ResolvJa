const pool = require('../../banco.js');

class SolicitanteRepository {
    async criar(dados) {
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
            dados.nome,
            dados.cpf,
            dados.rg,
            dados.email,
            dados.data_nascimento,
            dados.telefone,
            dados.senha,
            dados.endereco,
            dados.estado_civil
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async listarTodos() {
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
        return rows;
    }

    async buscarPorId(id) {
        const query = `
            SELECT
                id_solicitante,
                nome,
                cpf,
                rg,
                email,
                data_nascimento,
                telefone,
                endereco,
                estado_civil
            FROM solicitante
            WHERE id_solicitante = $1;
        `;

        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    async atualizar(id, dados) {
        const query = `
            UPDATE solicitante
            SET
                nome = COALESCE(NULLIF($1, ''), nome),
                email = COALESCE(NULLIF($2, ''), email),
                telefone = COALESCE(NULLIF($3, ''), telefone),
                endereco = COALESCE(NULLIF($4, ''), endereco),
                cpf = COALESCE(NULLIF($5, ''), cpf),
                rg = COALESCE(NULLIF($6, ''), rg),
                data_nascimento = COALESCE($7, data_nascimento)
            WHERE id_solicitante = $8
            RETURNING id_solicitante, nome, email, telefone, endereco, cpf, rg, data_nascimento, estado_civil;
        `;

        const values = [
            dados.nome,
            dados.email,
            dados.telefone,
            dados.endereco,
            dados.cpf,
            dados.rg,
            dados.data_nascimento,
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = new SolicitanteRepository();