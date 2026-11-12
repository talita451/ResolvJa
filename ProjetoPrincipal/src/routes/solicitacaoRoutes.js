const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/solicitacaoController');

// Rota para criar solicitação (POST /ResolvJa/solicitacoes)
router.post('/', solicitacaoController.criar);

// Rota para listar todas as solicitações (GET ResolvJa/solicitacoes)
router.get('/', solicitacaoController.listar);

// Rota para atualizar o status de uma solicitação (PUT /ResolvJa/solicitacoes/:id/status)
router.put('/:id/status', solicitacaoController.atualizarStatus);

// Rota para avaliar e salvar comentário na solicitação (PUT /ResolvJa/solicitacoes/:id/avaliar)
router.put('/:id/avaliar', solicitacaoController.avaliar);

// Rota para o prestador responder à avaliação do cliente (PUT /ResolvJa/solicitacoes/:id/responder-avaliacao)
router.put('/:id/responder-avaliacao', solicitacaoController.responderAvaliacao);

module.exports = router;