const express = require('express');
const router = express.Router();
const prestadorController = require('../controllers/prestadorController');

// Rota para cadastrar um novo prestador (POST /ResolvJa/prestadores)
router.post('/', prestadorController.cadastrar);

// Rota para listar todos os prestadores (GET /ResolvJa/prestadores)
router.get('/', prestadorController.listar);

// Rota para atualizar os dados cadastrais do prestador pelo ID (PUT /ResolvJa/prestadores/:id)
router.put('/:id', prestadorController.atualizar);

// Rota para vincular serviços ao prestador (POST /ResolvJa/prestadores/:id/servicos)
router.post('/:id/servicos', prestadorController.vincularServico);

// Rota para listar os serviços do prestador (GET /ResolvJa/prestadores/:id/servicos)
router.get('/:id/servicos', prestadorController.listarServicos);

module.exports = router;