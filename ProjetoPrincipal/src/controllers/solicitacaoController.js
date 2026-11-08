const solicitacaoRepository = require('../repositories/solicitacaoRepository');

class SolicitacaoController {
    async criar(req, res) {
        try {
            const novaSolicitacao = await solicitacaoRepository.criar(req.body);

            return res.status(201).json({
                mensagem: 'Solicitação criada com sucesso!',
                solicitacao: novaSolicitacao
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async listar(req, res) {
        try {
            const solicitacoes = await solicitacaoRepository.listarTodas();
            return res.json(solicitacoes);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async listarPorSolicitante(req, res) {
        const { id } = req.params;

        try {
            const solicitacoes = await solicitacaoRepository.listarPorSolicitante(id);
            return res.json(solicitacoes);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async atualizarStatus(req, res) {
        const { id } = req.params;
        const { status, cod_prestador } = req.body;

        console.log(`[BACKEND] Atualizando pedido ${id} | Status: ${status} | Prestador: ${cod_prestador}`);

        try {
            const solicitacaoAtualizada = await solicitacaoRepository.atualizarStatus(id, status, cod_prestador);

            if (!solicitacaoAtualizada) {
                return res.status(404).json({
                    erro: 'Solicitação não encontrada.'
                });
            }

            return res.json({
                mensagem: 'Status atualizado com sucesso!',
                solicitacao: solicitacaoAtualizada
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async avaliar(req, res) {
        const { id } = req.params;
        const { status, nota, comentario, foto_avaliacao } = req.body;

        try {
            const solicitacaoAvaliada = await solicitacaoRepository.avaliar(id, status, nota, comentario, foto_avaliacao);

            if (!solicitacaoAvaliada) {
                return res.status(404).json({
                    erro: 'Solicitação não encontrada.'
                });
            }

            return res.json({
                mensagem: 'Avaliação registrada com sucesso!',
                solicitacao: solicitacaoAvaliada
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async responderAvaliacao(req, res) {
        const { id } = req.params;
        const { resposta } = req.body;

        try {
            const solicitacaoAtualizada = await solicitacaoRepository.responderAvaliacao(id, resposta);

            if (!solicitacaoAtualizada) {
                return res.status(404).json({
                    erro: 'Solicitação não encontrada.'
                });
            }

            return res.json({
                mensagem: 'Resposta registrada com sucesso!',
                solicitacao: solicitacaoAtualizada
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }
}

module.exports = new SolicitacaoController();