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
}

module.exports = new SolicitanteController();