const express = require('express');
const router = express.Router();

const solicitanteRoutes = require('./solicitanteRoutes');
const prestadorRoutes = require('./prestadorRoutes');
const tipoServicoRoutes = require('./tipoServicoRoutes');
const solicitacaoRoutes = require('./solicitacaoRoutes');
const solicitacaoController = require('../controllers/solicitacaoController');

// Mapeia os caminhos principais
router.use('/solicitantes', solicitanteRoutes);
router.use('/prestadores', prestadorRoutes);
router.use('/servicos', tipoServicoRoutes);
router.use('/solicitacoes', solicitacaoRoutes);

// Rota específica do seu roteador original: buscar solicitações de um solicitante
router.get('/solicitantes/:id/solicitacoes', solicitacaoController.listarPorSolicitante);

module.exports = router;