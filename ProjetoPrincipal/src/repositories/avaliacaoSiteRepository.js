const pool = require('../../banco.js');

class AvaliacaoSiteRepository {
    async criar(dados) {
        const query = `
            INSERT INTO avaliacao_site
            (id_usuario, nome_usuario, nota, comentario)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [dados.id_usuario, dados.nome_usuario, dados.nota, dados.comentario];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async listarTodas() {
        const query = `
            SELECT * FROM avaliacao_site
            ORDER BY criado_em DESC;
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
}
module.exports = new AvaliacaoSiteRepository();