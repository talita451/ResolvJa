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
}

module.exports = new SolicitanteRepository();