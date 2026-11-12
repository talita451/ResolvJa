const express = require('express');
const router = express.Router();
const avaliacaoSiteController = require('../controllers/avaliacaoSiteController');

// Rota para criar avaliação do site (POST /ResolvJa/avaliacoes-site)
router.post('/', avaliacaoSiteController.criar);

// Rota para listar todas as avaliações do site (GET /ResolvJa/avaliacoes-site)
router.get('/', avaliacaoSiteController.listar);

module.exports = router;