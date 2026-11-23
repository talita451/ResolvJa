// src/controllers/solicitanteController.js
const solicitanteRepository = require('../repositories/solicitanteRepository');
const { salvarImagemEmPasta } = require('../utils/salvarImagem');

class SolicitanteController {
    async cadastrar(req, res) {
        try {
            const dados = { ...req.body };
            // Se vier foto no cadastro, salva na pasta /uploads e grava apenas o caminho no banco
            if (dados.foto_perfil) {
                dados.foto_perfil = salvarImagemEmPasta(dados.foto_perfil, 'cliente');
            }

            const novoSolicitante = await solicitanteRepository.criar(dados);

            return res.status(201).json({
                mensagem: 'Solicitante cadastrado com sucesso!',
                solicitante: novoSolicitante
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ erro: 'E-mail ou CPF já cadastrados no sistema.' });
            }
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
            const dadosAtualizados = { ...req.body };

            // Salva a nova foto do cliente na pasta /uploads e grava apenas o caminho no banco
            if (dadosAtualizados.foto_perfil) {
                dadosAtualizados.foto_perfil = salvarImagemEmPasta(dadosAtualizados.foto_perfil, 'cliente');
            }

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
