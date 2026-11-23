// src/utils/salvarImagem.js
// Converte imagens recebidas em Base64 do front-end e salva fisicamente na pasta "uploads" do site,
// retornando apenas o caminho público (/uploads/arquivo.ext) para salvar no banco de dados.

const fs = require('fs');
const path = require('path');

function salvarImagemEmPasta(imagemBase64, prefixo = 'img') {
    // Se não houver imagem enviada, retorna null
    if (!imagemBase64 || typeof imagemBase64 !== 'string') {
        return null;
    }

    // Se já for um caminho salvo anteriormente (ex: /uploads/perfil_123.jpg), mantém sem alterar
    if (!imagemBase64.startsWith('data:image/')) {
        return imagemBase64;
    }

    // Garante que a pasta "uploads" exista na raiz do projeto
    const pastaUploads = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(pastaUploads)) {
        fs.mkdirSync(pastaUploads, { recursive: true });
    }

    // Extrai a extensão da imagem e o conteúdo em Base64
    const matches = imagemBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        console.warn('⚠️ Formato de imagem Base64 inválido ao tentar salvar em pasta.');
        return null;
    }

    let extensao = matches[1].toLowerCase();
    if (extensao === 'jpeg') extensao = 'jpg';

    const buffer = Buffer.from(matches[2], 'base64');

    // Gera nome único para não sobrescrever outras fotos
    const nomeArquivo = `${prefixo}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${extensao}`;
    const caminhoCompleto = path.join(pastaUploads, nomeArquivo);

    // Salva a imagem na pasta uploads do site
    fs.writeFileSync(caminhoCompleto, buffer);
    console.log(`📸 Foto salva na pasta uploads: /uploads/${nomeArquivo}`);

    // Retorna o caminho relativo que será gravado no banco de dados
    return `/uploads/${nomeArquivo}`;
}

module.exports = { salvarImagemEmPasta };
