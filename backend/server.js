const express = require("express");
const cors = require("cors");
const pool = require("./banco");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Teste da API
app.get("/", (req, res) => {
  res.json({
    mensagem: "API do ResolvJá funcionando!"
  });
});

// Teste da conexão com o Neon
app.get("/api/teste-banco", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW() AS agora");

    res.json({
      conectado: true,
      banco: "Neon PostgreSQL",
      horario: resultado.rows[0].agora
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      conectado: false,
      erro: "Não foi possível conectar ao banco."
    });
  }
});

// ======================================================
// SOLICITANTES
// ======================================================

// Cadastrar solicitante
app.post("/api/solicitantes", async (req, res) => {
  try {
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

    if (!nome || !cpf || !rg || !email || !data_nascimento ||
        !telefone || !senha || !endereco) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios."
      });
    }

    const sql = `
      INSERT INTO solicitante
      (
        nome, cpf, rg, email, data_nascimento,
        telefone, senha, endereco, estado_civil
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id_solicitante, nome, email, telefone, criado_em
    `;

    const valores = [
      nome, cpf, rg, email, data_nascimento,
      telefone, senha, endereco, estado_civil || null
    ];

    const resultado = await pool.query(sql, valores);

    res.status(201).json({
      mensagem: "Solicitante cadastrado com sucesso!",
      solicitante: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    if (erro.code === "23505") {
      return res.status(409).json({
        erro: "CPF ou e-mail já cadastrado."
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar solicitante."
    });
  }
});

// Listar solicitantes
app.get("/api/solicitantes", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id_solicitante,
        nome,
        cpf,
        rg,
        email,
        data_nascimento,
        telefone,
        endereco,
        estado_civil,
        criado_em
      FROM solicitante
      ORDER BY id_solicitante DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar solicitantes." });
  }
});

// ======================================================
// PRESTADORES
// ======================================================

// Cadastrar prestador
app.post("/api/prestadores", async (req, res) => {
  try {
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

    if (!nome || !email || !cpf || !rg || !data_nascimento ||
        !telefone || !endereco_completo || !profissao_funcao ||
        !experiencia || possui_equipamentos === undefined ||
        valor_minimo === undefined || valor_maximo === undefined ||
        !disponibilidade_horario) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios."
      });
    }

    const sql = `
      INSERT INTO prestador
      (
        nome, email, cpf, rg, cnh, sexo, data_nascimento,
        telefone, escolaridade, endereco_completo,
        profissao_funcao, experiencia, descricao_funcoes,
        possui_equipamentos, valor_minimo, valor_maximo,
        antecedentes_criminais, disponibilidade_horario
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING cod_prestador, nome, email, profissao_funcao, criado_em
    `;

    const valores = [
      nome, email, cpf, rg, cnh || null, sexo || null, data_nascimento,
      telefone, escolaridade || null, endereco_completo,
      profissao_funcao, experiencia, descricao_funcoes || null,
      possui_equipamentos, valor_minimo, valor_maximo,
      antecedentes_criminais || null, disponibilidade_horario
    ];

    const resultado = await pool.query(sql, valores);

    res.status(201).json({
      mensagem: "Prestador cadastrado com sucesso!",
      prestador: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    if (erro.code === "23505") {
      return res.status(409).json({
        erro: "CPF ou e-mail já cadastrado."
      });
    }

    if (erro.code === "23514") {
      return res.status(400).json({
        erro: "Verifique a experiência ou os valores informados."
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar prestador."
    });
  }
});

// Listar prestadores
app.get("/api/prestadores", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        cod_prestador,
        nome,
        email,
        cpf,
        telefone,
        profissao_funcao,
        experiencia,
        descricao_funcoes,
        possui_equipamentos,
        valor_minimo,
        valor_maximo,
        disponibilidade_horario,
        criado_em
      FROM prestador
      ORDER BY cod_prestador DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar prestadores." });
  }
});

// ======================================================
// SERVIÇOS
// ======================================================

// Criar solicitação de serviço
app.post("/api/servicos", async (req, res) => {
  try {
    const {
      id_solicitante,
      titulo,
      descricao
    } = req.body;

    if (!id_solicitante || !titulo) {
      return res.status(400).json({
        erro: "Solicitante e título são obrigatórios."
      });
    }

    const sql = `
      INSERT INTO servico
      (
        id_solicitante,
        titulo,
        descricao
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const resultado = await pool.query(sql, [
      id_solicitante,
      titulo,
      descricao || null
    ]);

    res.status(201).json({
      mensagem: "Serviço solicitado com sucesso!",
      servico: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    if (erro.code === "23503") {
      return res.status(404).json({
        erro: "Solicitante não encontrado."
      });
    }

    res.status(500).json({
      erro: "Erro ao criar serviço."
    });
  }
});

// Listar serviços com nome do solicitante e prestador
app.get("/api/servicos", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        s.id_servico,
        s.titulo,
        s.descricao,
        s.status,
        s.data_solicitacao,

        so.id_solicitante,
        so.nome AS solicitante,

        p.cod_prestador,
        p.nome AS prestador,
        p.profissao_funcao

      FROM servico s

      INNER JOIN solicitante so
        ON so.id_solicitante = s.id_solicitante

      LEFT JOIN prestador p
        ON p.cod_prestador = s.cod_prestador

      ORDER BY s.id_servico DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar serviços." });
  }
});

// Prestador aceita um serviço
app.put("/api/servicos/:id/aceitar", async (req, res) => {
  try {
    const idServico = req.params.id;
    const { cod_prestador } = req.body;

    if (!cod_prestador) {
      return res.status(400).json({
        erro: "Informe o código do prestador."
      });
    }

    const resultado = await pool.query(`
      UPDATE servico
      SET
        cod_prestador = $1,
        status = 'Em Andamento'
      WHERE id_servico = $2
        AND status = 'Pendente'
      RETURNING *
    `, [cod_prestador, idServico]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Serviço não encontrado, já foi aceito ou não está pendente."
      });
    }

    res.json({
      mensagem: "Serviço aceito pelo prestador!",
      servico: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    if (erro.code === "23503") {
      return res.status(404).json({
        erro: "Prestador não encontrado."
      });
    }

    res.status(500).json({
      erro: "Erro ao aceitar serviço."
    });
  }
});

// Alterar status do serviço
app.put("/api/servicos/:id/status", async (req, res) => {
  try {
    const idServico = req.params.id;
    const { status } = req.body;

    const statusPermitidos = [
      "Pendente",
      "Em Andamento",
      "Concluído",
      "Cancelado"
    ];

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        erro: "Status inválido."
      });
    }

    const resultado = await pool.query(`
      UPDATE servico
      SET status = $1
      WHERE id_servico = $2
      RETURNING *
    `, [status, idServico]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Serviço não encontrado."
      });
    }

    res.json({
      mensagem: "Status atualizado!",
      servico: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao atualizar serviço."
    });
  }
});

app.listen(PORT, () => {
  console.log(`ResolvJá rodando em http://localhost:${PORT}`);
});
