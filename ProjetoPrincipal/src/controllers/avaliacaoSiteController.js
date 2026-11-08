const avaliacaoSiteRepository = require('../repositories/avaliacaoSiteRepository');

class AvaliacaoSiteController {
    async criar(req, res) {
        try {
            const novaAvaliacao = await avaliacaoSiteRepository.criar(req.body);
            return res.status(201).json({
                mensagem: 'Avaliação do site salva com sucesso!',
                avaliacao: novaAvaliacao
            });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    async listar(req, res) {
        try {
            const avaliacoes = await avaliacaoSiteRepository.listarTodas();
            return res.json(avaliacoes);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}
module.exports = new AvaliacaoSiteController();