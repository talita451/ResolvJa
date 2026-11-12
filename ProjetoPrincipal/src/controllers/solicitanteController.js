const solicitanteRepository = require('../repositories/solicitanteRepository');

class SolicitanteController {
    async cadastrar(req, res) {
        try {
            const novoSolicitante = await solicitanteRepository.criar(req.body);

            return res.status(201).json({
                mensagem: 'Solicitante cadastrado com sucesso!',
                solicitante: novoSolicitante
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async listar(req, res) {
        try {
            const solicitantes = await solicitanteRepository.listarTodos();
            return res.json(solicitantes);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const solicitante = await solicitanteRepository.buscarPorId(id);

            if (!solicitante) {
                return res.status(404).json({ erro: 'Solicitante não encontrado.' });
            }

            return res.json(solicitante);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizados = req.body;

            const solicitanteAtualizado = await solicitanteRepository.atualizar(id, dadosAtualizados);

            if (!solicitanteAtualizado) {
                return res.status(404).json({ erro: 'Solicitante não encontrado para atualização.' });
            }

            return res.json({
                mensagem: 'Dados atualizados com sucesso!',
                solicitante: solicitanteAtualizado
            });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = new SolicitanteController();