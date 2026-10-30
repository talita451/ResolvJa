const prestadorRepository = require('../repositories/prestadorRepository');

class PrestadorController {
    async cadastrar(req, res) {
        try {
            const novoPrestador = await prestadorRepository.criar(req.body);

            return res.status(201).json({
                mensagem: 'Prestador cadastrado com sucesso!',
                prestador: novoPrestador
            });
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async listar(req, res) {
        try {
            const prestadores = await prestadorRepository.listarTodos();
            return res.json(prestadores);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async vincularServico(req, res) {
        const { id } = req.params;
        const { id_tipo_servico } = req.body;

        try {
            const vinculo = await prestadorRepository.vincularServico(id, id_tipo_servico);

            return res.status(201).json({
                mensagem: 'Serviço vinculado ao prestador!',
                prestador_servico: vinculo
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({
                    erro: 'Este prestador já oferece este serviço.'
                });
            }

            return res.status(500).json({
                erro: error.message
            });
        }
    }

    async listarServicos(req, res) {
        const { id } = req.params;

        try {
            const servicos = await prestadorRepository.listarServicosDoPrestador(id);
            return res.json(servicos);
        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }
}

module.exports = new PrestadorController();