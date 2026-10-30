const express = require('express');
const router = express.Router();
const tipoServicoController = require('../controllers/tipoServicoController');

// Rota para listar todos os serviços ativos (GET /api/servicos)
router.get('/', tipoServicoController.listar);

// Rota para cadastrar um novo serviço (POST /api/servicos)
router.post('/', tipoServicoController.cadastrar);

// Rota para listar prestadores que oferecem um serviço específico (GET /api/servicos/:id/prestadores)
router.get('/:id/prestadores', tipoServicoController.listarPrestadores);

module.exports = router;