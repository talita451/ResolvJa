const pool = require('../../banco.js');

class SolicitacaoRepository {
    async criar(dados) {
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
            dados.id_solicitante,
            dados.id_tipo_servico,
            dados.cod_prestador,
            dados.data_servico,
            dados.horario,
            dados.endereco,
            dados.descricao,
            dados.valor_combinado
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async listarTodas() {
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
        return rows;
    }

    async listarPorSolicitante(idSolicitante) {
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

        const { rows } = await pool.query(query, [idSolicitante]);
        return rows;
    }

    async atualizarStatus(idSolicitacao, status) {
        const query = `
            UPDATE solicitacao
            SET status = $1
            WHERE id_solicitacao = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [status, idSolicitacao]);
        return rows[0];
    }
}

module.exports = new SolicitacaoRepository();