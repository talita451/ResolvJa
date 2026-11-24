// tests/regrasResolvJa.test.js
// Testes Unitários (Caixa Branca) das regras de negócio do ResolvJá

const bcrypt = require('bcryptjs');

function definirProfissaoPadrao(profissao, codigoPrestador) {
  if (!codigoPrestador && (!profissao || profissao.trim() === '')) {
    return 'Marido de Aluguel';
  }
  return profissao;
}

function validarCPF(cpf) {
  if (!cpf) return false;
  return cpf.replace(/\D/g, '').length === 11;
}

function validarFormasPagamento(formas) {
  return Array.isArray(formas) && formas.length > 0;
}

describe('Caixa Branca - Regras de Negócio do ResolvJá', () => {
  test('Deve atribuir "Marido de Aluguel" quando profissão e código estiverem ausentes', () => {
    expect(definirProfissaoPadrao('', null)).toBe('Marido de Aluguel');
  });

  test('Deve manter a profissão escolhida quando ela for informada', () => {
    expect(definirProfissaoPadrao('Eletricista', 10)).toBe('Eletricista');
  });

  test('Deve validar CPF com 11 dígitos (com ou sem máscara)', () => {
    expect(validarCPF('123.456.789-01')).toBe(true);
    expect(validarCPF('12345678901')).toBe(true);
    expect(validarCPF('123.456')).toBe(false);
  });

  test('Deve exigir ao menos uma forma de pagamento selecionada pelo prestador', () => {
    expect(validarFormasPagamento(['PIX', 'Dinheiro'])).toBe(true);
    expect(validarFormasPagamento([])).toBe(false);
  });

  test('Deve criptografar a senha com bcryptjs e validar com compare()', async () => {
    const senhaOriginal = 'ResolvJa2026';
    const hash = await bcrypt.hash(senhaOriginal, 10);

    expect(hash).not.toBe(senhaOriginal);
    expect(await bcrypt.compare(senhaOriginal, hash)).toBe(true);
    expect(await bcrypt.compare('SenhaErrada', hash)).toBe(false);
  });
});