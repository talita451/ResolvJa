const tipoServicoRepository = require('../repositories/tipoServicoRepository');

class TipoServicoController {
    async listar(req, res) {
        try {
            const servicos = await tipoServicoRepository.listarAtivos();
            return res.json(servicos);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async cadastrar(req, res) {
        try {
            const novoServico = await tipoServicoRepository.criar(req.body);

            return res.status(201).json({
                mensagem: 'Serviço cadastrado com sucesso!',
                servico: novoServico
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async listarPrestadores(req, res) {
        const { id } = req.params;

        try {
            const prestadores = await tipoServicoRepository.listarPrestadoresPorServico(id);
            return res.json(prestadores);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }
}

module.exports = new TipoServicoController();