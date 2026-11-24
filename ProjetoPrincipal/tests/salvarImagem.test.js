// tests/salvarImagem.test.js
// Teste de Caixa Branca da função real salvarImagemEmPasta (src/utils/salvarImagem.js)

const fs = require('fs');
const path = require('path');
const { salvarImagemEmPasta } = require('../src/utils/salvarImagem');

describe('Caixa Branca - Utilitário salvarImagemEmPasta', () => {
  test('Deve retornar null quando nenhuma imagem for enviada', () => {
    expect(salvarImagemEmPasta(null)).toBeNull();
    expect(salvarImagemEmPasta('')).toBeNull();
    expect(salvarImagemEmPasta(12345)).toBeNull();
  });

  test('Deve manter o caminho sem alterar quando já for uma URL/caminho salvo', () => {
    const caminhoExistente = '/uploads/perfil_123.webp';
    expect(salvarImagemEmPasta(caminhoExistente)).toBe(caminhoExistente);
  });

  test('Deve retornar null quando o formato Base64 for inválido', () => {
    const base64Invalido = 'data:image/png;base64_sem_virgula';
    expect(salvarImagemEmPasta(base64Invalido)).toBeNull();
  });

  test('Deve salvar uma imagem Base64 válida na pasta uploads e retornar o caminho público', () => {
    // Pixel PNG 1x1 válido em Base64
    const pngValido =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const caminhoRetornado = salvarImagemEmPasta(pngValido, 'teste_jest');

    expect(caminhoRetornado).toMatch(/^\/uploads\/teste_jest_\d+_\d+\.png$/);

    // Limpa o arquivo temporário criado durante o teste
    const caminhoFisico = path.join(__dirname, '..', caminhoRetornado);
    expect(fs.existsSync(caminhoFisico)).toBe(true);
    fs.unlinkSync(caminhoFisico);
  });
});