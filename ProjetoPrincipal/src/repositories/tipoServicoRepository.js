const pool = require('../../banco.js');

class TipoServicoRepository {
    async listarAtivos() {
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
        return rows;
    }

    async criar(dados) {
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
            dados.nome,
            dados.descricao
        ]);
        return rows[0];
    }

    async listarPrestadoresPorServico(idTipoServico) {
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

        const { rows } = await pool.query(query, [idTipoServico]);
        return rows;
    }
}

module.exports = new TipoServicoRepository();