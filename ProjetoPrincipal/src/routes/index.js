const express = require('express');
const router = express.Router();

const solicitanteRoutes = require('./solicitanteRoutes');
const prestadorRoutes = require('./prestadorRoutes');
const tipoServicoRoutes = require('./tipoServicoRoutes');
const solicitacaoRoutes = require('./solicitacaoRoutes');
const avaliacaoSiteRoutes = require('./avaliacaoSiteRoutes'); // NOVO
const solicitacaoController = require('../controllers/solicitacaoController');

// Mapeia os caminhos principais

// Rotas para solicitantes (Base: /ResolvJa/solicitantes)
router.use('/solicitantes', solicitanteRoutes);

// Rotas para prestadores (Base: /ResolvJa/prestadores)
router.use('/prestadores', prestadorRoutes);

// Rotas para serviços (Base: /ResolvJa/servicos)
router.use('/servicos', tipoServicoRoutes);

// Rotas para solicitações (Base: /ResolvJa/solicitacoes)
router.use('/solicitacoes', solicitacaoRoutes);

// Rotas para avaliações do site (Base: /ResolvJa/avaliacoes-site)
router.use('/avaliacoes-site', avaliacaoSiteRoutes); // NOVO

// Rota para buscar solicitações de um solicitante específico (GET /ResolvJa/solicitantes/:id/solicitacoes)
router.get('/solicitantes/:id/solicitacoes', solicitacaoController.listarPorSolicitante);

module.exports = router;