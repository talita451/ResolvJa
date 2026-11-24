// server.js - Servidor principal Node.js + Express do ResolvJá
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const pool = require('./banco');
const errorHandler = require('./src/middlewares/errorHandler');

// Carrega as variáveis de ambiente do arquivo .env (em produção usa as variáveis da hospedagem)
dotenv.config();

const app = express();

// Habilita o CORS para permitir requisições do front-end (local e publicado)
app.use(cors());

// Permite que o servidor receba dados em formato JSON e imagens enviadas para salvamento em pasta
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// =========================================================================
// 1. SERVIR ARQUIVOS ESTÁTICOS DO FRONT-END (HTML, CSS, JS, ASSETS E UPLOADS)
// =========================================================================
// Libera a pasta "uploads" para exibir as fotos salvas no site
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve os arquivos estáticos da raiz do projeto (HTMLs, style.css, assets, src)
app.use(express.static(path.join(__dirname)));

// Rota inicial: abre a página principal index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =========================================================================
// 2. ROTA DE DIAGNÓSTICO DO BANCO DE DADOS (ÚTIL NO DEPLOY)
// =========================================================================
app.get('/ResolvJa/status-banco', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW() AS hora_servidor');
        return res.json({
            conectado: true,
            hora_banco: resultado.rows[0].hora_servidor
        });
    } catch (erro) {
        console.error('❌ Erro no teste de conexão com o banco:', erro.message);
        return res.status(500).json({
            conectado: false,
            erro: erro.message
        });
    }
});

// =========================================================================
// 3. ROTAS DA API
// =========================================================================
const routes = require('./src/routes');
app.use('/ResolvJa', routes);

// Middleware global de tratamento de erros da API
app.use(errorHandler);

// Define a porta do servidor (usa process.env.PORT no deploy ou 3000 localmente)
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
}

module.exports = app;
