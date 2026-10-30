const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/solicitacaoController');

// Rota para criar solicitação (POST /api/solicitacoes)
router.post('/', solicitacaoController.criar);

// Rota para listar todas as solicitações (GET /api/solicitacoes)
router.get('/', solicitacaoController.listar);

// Rota para atualizar o status de uma solicitação (PUT /api/solicitacoes/:id/status)
router.put('/:id/status', solicitacaoController.atualizarStatus);

module.exports = router;
