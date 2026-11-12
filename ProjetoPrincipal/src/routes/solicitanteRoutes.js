const express = require('express');
const router = express.Router();
const solicitanteController = require('../controllers/solicitanteController');

// Rota para cadastrar solicitante (POST /ResolvJa/solicitantes)
router.post('/', solicitanteController.cadastrar);

// Rota para listar solicitantes (GET /ResolvJa/solicitantes)
router.get('/', solicitanteController.listar);

// Rota para buscar solicitante por ID (GET /ResolvJa/solicitantes/:id)
router.get('/:id', solicitanteController.buscarPorId);

// Rota para atualizar solicitante por ID (PUT /ResolvJa/solicitantes/:id)
router.put('/:id', solicitanteController.atualizar);

module.exports = router;