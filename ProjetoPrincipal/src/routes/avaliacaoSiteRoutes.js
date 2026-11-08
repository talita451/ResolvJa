const express = require('express');
const router = express.Router();
const avaliacaoSiteController = require('../controllers/avaliacaoSiteController');

router.post('/', avaliacaoSiteController.criar);
router.get('/', avaliacaoSiteController.listar);

module.exports = router;