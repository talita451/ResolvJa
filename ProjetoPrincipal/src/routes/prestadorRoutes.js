const express = require('express');
const router = express.Router();
const prestadorController = require('../controllers/prestadorController');

// Rota para cadastrar prestador (POST /api/prestadores)
router.post('/', prestadorController.cadastrar);

// Rota para listar todos os prestadores do banco (GET /api/prestadores)
router.get('/', prestadorController.listar);

// Rota para vincular serviço ao prestador (POST /api/prestadores/:id/servicos)
router.post('/:id/servicos', prestadorController.vincularServico);

// Rota para listar serviços de um prestador específico (GET /api/prestadores/:id/servicos)
router.get('/:id/servicos', prestadorController.listarServicos);

module.exports = router;