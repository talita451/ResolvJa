const express = require('express');
const router = express.Router();
const prestadorController = require('../controllers/prestadorController');

// Rota para cadastrar um novo prestador
router.post('/', prestadorController.cadastrar);

// Rota para listar todos os prestadores
router.get('/', prestadorController.listar);

// Rota para atualizar os dados cadastrais do prestador pelo ID
router.put('/:id', prestadorController.atualizar);

// Rotas para vincular e listar serviços do prestador
router.post('/:id/servicos', prestadorController.vincularServico);
router.get('/:id/servicos', prestadorController.listarServicos);

module.exports = router;