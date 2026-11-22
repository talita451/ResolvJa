// banco.js - Conexão centralizada com o PostgreSQL (Neon)
require("dotenv").config();
const { Pool } = require("pg");

// Remove espaços ou aspas extras caso a variável tenha sido colada com aspas no painel de deploy
const rawUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, "") : "";

if (!rawUrl) {
  throw new Error("DATABASE_URL não foi configurada no arquivo .env ou nas variáveis de ambiente da hospedagem.");
}

// Configura o pool com SSL habilitado (obrigatório para Neon PostgreSQL local e publicado)
const pool = new Pool({
  connectionString: rawUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Evita que um erro momentâneo de conexão derrube o servidor Node em produção
pool.on("error", (err) => {
  console.error("⚠️ Erro inesperado no pool do PostgreSQL:", err.message);
});

// Testa a conexão e garante que as colunas necessárias existam nas tabelas
pool.connect()
  .then(async (client) => {
    console.log("✅ Conexão com o banco de dados PostgreSQL (Neon) estabelecida com sucesso!");
    try {
      // Garante a coluna de formas de pagamento no prestador
      await client.query("ALTER TABLE prestador ADD COLUMN IF NOT EXISTS formas_pagamento TEXT;");
      // Garante a coluna de foto de perfil também no solicitante (cliente)
      await client.query("ALTER TABLE solicitante ADD COLUMN IF NOT EXISTS foto_perfil TEXT;");
    } catch (migErr) {
      console.warn("⚠️ Aviso ao verificar colunas automáticas:", migErr.message);
    } finally {
      client.release();
    }
  })
  .catch((err) => {
    console.error("❌ Falha ao conectar no banco de dados PostgreSQL:", err.message);
  });

module.exports = pool;
