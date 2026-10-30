const pool = require('../../banco.js');

class PrestadorRepository {
    async criar(dados) {
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
            dados.nome,
            dados.email,
            dados.cpf,
            dados.rg,
            dados.cnh,
            dados.sexo,
            dados.data_nascimento,
            dados.telefone,
            dados.escolaridade,
            dados.endereco_completo,
            dados.profissao_funcao,
            dados.experiencia,
            dados.descricao_funcoes,
            dados.possui_equipamentos,
            dados.valor_minimo,
            dados.valor_maximo,
            dados.antecedentes_criminais,
            dados.disponibilidade_horario
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async listarTodos() {
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
        return rows;
    }

    async vincularServico(codPrestador, idTipoServico) {
        const query = `
            INSERT INTO prestador_servico
            (
                cod_prestador,
                id_tipo_servico
            )
            VALUES ($1, $2)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [codPrestador, idTipoServico]);
        return rows[0];
    }

    async listarServicosDoPrestador(codPrestador) {
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

        const { rows } = await pool.query(query, [codPrestador]);
        return rows;
    }
}

module.exports = new PrestadorRepository();