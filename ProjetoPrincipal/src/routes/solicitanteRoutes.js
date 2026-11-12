const express = require('express');
const router = express.Router();
const solicitanteController = require('../controllers/solicitanteController');

// Rota para cadastrar solicitante (POST /api/solicitantes)
router.post('/', solicitanteController.cadastrar);

// Rota para listar solicitantes (GET /api/solicitantes)
router.get('/', solicitanteController.listar);

// Rota para buscar solicitante por ID (GET /api/solicitantes/:id)
router.get('/:id', solicitanteController.buscarPorId);

// Rota para atualizar solicitante por ID (PUT /api/solicitantes/:id)
router.put('/:id', solicitanteController.atualizar);

module.exports = router;