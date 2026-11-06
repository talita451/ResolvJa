// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('❌ Erro capturado pelo Middleware:', err.stack);

    // Erro de violação de chave única no PostgreSQL (ex: CPF ou E-mail duplicado)
    if (err.code === '23505') {
        return res.status(409).json({
            sucesso: false,
            erro: 'Conflito de dados: E-mail ou CPF já cadastrado no sistema.'
        });
    }

    // Erro de chave estrangeira violada
    if (err.code === '23503') {
        return res.status(400).json({
            sucesso: false,
            erro: 'Erro de referência: O registro associado não foi encontrado no banco de dados.'
        });
    }

    // Erro genérico do Servidor
    return res.status(500).json({
        sucesso: false,
        erro: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
    });
};

module.exports = errorHandler;