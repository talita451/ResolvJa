const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorHandler');

// Carrega as variáveis de ambiente do ficheiro .env
dotenv.config();

const app = express();

// Habilita o CORS para permitir requisições do front-end
app.use(cors());

// Permite que o servidor receba dados em formato JSON
app.use(express.json());

// =========================================================================
// 1. SERVIR ARQUIVOS ESTÁTICOS DO FRONT-END (HTML, CSS, JS)
// =========================================================================
app.use(express.static(path.join(__dirname)));

// Força o servidor a abrir o seu frontAlternativo.html ao acessar a raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontAlternativo.html'));
});

// =========================================================================
// 2. ROTAS DA API
// =========================================================================
const routes = require('./src/routes');
app.use('/api', routes);

// Middleware global de tratamento de erros da API
app.use(errorHandler);

// Define a porta do servidor (padrão 3000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
});