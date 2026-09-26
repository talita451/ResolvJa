const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');


dotenv.config();

const app = express();
app.use(cors());

// Permite receber JSON
app.use(express.json());

// Importa as rotas
const routes = require('./router');

// Todas as rotas começam com /api
app.use('/api', routes);

// Rota inicial para testar se a API está funcionando
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API do ResolvJá funcionando!'
    });
});

// Porta do servidor

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});