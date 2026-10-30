const express = require('express');
const router = express.Router();
const solicitanteController = require('../controllers/solicitanteController');

// Rota para cadastrar solicitante (POST /api/solicitantes)
router.post('/', solicitanteController.cadastrar);

// Rota para listar solicitantes (GET /api/solicitantes)
router.get('/', solicitanteController.listar);

module.exports = router;